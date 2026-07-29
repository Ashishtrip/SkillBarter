import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exchange from '@/models/Exchange';
import User from '@/models/User';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    try {
        const exchange = await Exchange.findById(params.id);

        if (!exchange) {
            return NextResponse.json({ message: 'Exchange not found' }, { status: 404 });
        }

        // Ensure the user is a participant of the exchange
        if (!exchange.participants.some(p => p.toString() === session.user.id)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        if (exchange.status !== 'active') {
            return NextResponse.json({ message: 'Exchange is not active' }, { status: 400 });
        }

        if (!exchange.startTime) {
            return NextResponse.json({ message: 'Call has not started' }, { status: 400 });
        }

        exchange.endTime = new Date();
        exchange.status = 'completed';
        await exchange.save();

        const durationInMs = exchange.endTime.getTime() - exchange.startTime.getTime();
        const durationInHours = durationInMs / 1000 / 60 / 60;

        // Update the credit balance of the participants
        const participant1 = await User.findById(exchange.participants[0]);
        const participant2 = await User.findById(exchange.participants[1]);

        if (participant1 && participant2) {
            // This logic assumes participant1 is the teacher and participant2 is the learner.
            // In a real application, you would need a way to distinguish between the teacher and the learner.
            participant1.credit += durationInHours;
            participant2.credit -= durationInHours;
            await participant1.save();
            await participant2.save();
        }

        return NextResponse.json({ message: 'Call ended successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error ending call', error }, { status: 500 });
    }
}
