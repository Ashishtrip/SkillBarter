import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exchange from '@/models/Exchange';
import User from '@/models/User';
import Credit from '@/models/Credit';

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

        if (exchange.status !== 'active') {
            return NextResponse.json({ message: 'Exchange is not active' }, { status: 400 });
        }

        // Ensure the user is a participant of the exchange
        if (!exchange.participants.some(p => p.toString() === session.user.id)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        exchange.status = 'completed';
        await exchange.save();

        // Calculate the duration of the exchange
        const durationInHours = 1; // This is a placeholder. I will implement the logic to calculate the duration later.

        // Update the credit balance of the participants
        const participant1 = await User.findById(exchange.participants[0]);
        const participant2 = await User.findById(exchange.participants[1]);

        if (participant1 && participant2) {
            participant1.credit += durationInHours;
            participant2.credit -= durationInHours;
            await participant1.save();
            await participant2.save();
        }

        return NextResponse.json({ message: 'Exchange completed successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error completing exchange', error }, { status: 500 });
    }
}
