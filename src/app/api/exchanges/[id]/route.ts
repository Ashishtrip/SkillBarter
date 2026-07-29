
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exchange from '@/models/Exchange';
import User from '@/models/User';
import Skill from '@/models/Skill';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  try {
    const exchange = await Exchange.findById(params.id)
      .populate('offeredBy', 'name email avatar')
      .populate('requestedBy', 'name email avatar')
      .populate('skills.offered', 'name category')
      .populate('skills.requested', 'name category');

    if (!exchange) {
      return NextResponse.json({ message: 'Exchange not found' }, { status: 404 });
    }

    // Ensure the user is a participant of the exchange
    if (exchange.offeredBy._id.toString() !== session.user.id && exchange.requestedBy._id.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(exchange);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching exchange', error }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { scheduledFor, status } = await req.json();

    if (!scheduledFor && !status) {
        return NextResponse.json({ message: 'Missing scheduledFor or status' }, { status: 400 });
    }

    if (status && !['pending', 'active', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await connectDB();

    try {
        const exchange = await Exchange.findById(params.id);

        if (!exchange) {
            return NextResponse.json({ message: 'Exchange not found' }, { status: 404 });
        }

        // Ensure the user is a participant of the exchange
        if (exchange.offeredBy.toString() !== session.user.id && exchange.requestedBy.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        if (scheduledFor) {
            exchange.scheduledFor = scheduledFor;
        }

        if (status) {
            exchange.status = status;
        }
        
        await exchange.save();

        return NextResponse.json(exchange);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating exchange', error }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
        if (exchange.offeredBy.toString() !== session.user.id && exchange.requestedBy.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await exchange.deleteOne();

        return NextResponse.json({ message: 'Exchange deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting exchange', error }, { status: 500 });
    }
}
