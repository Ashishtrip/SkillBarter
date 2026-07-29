import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exchange from '@/models/Exchange';

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

        exchange.startTime = new Date();
        await exchange.save();

        return NextResponse.json({ message: 'Call started successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error starting call', error }, { status: 500 });
    }
}
