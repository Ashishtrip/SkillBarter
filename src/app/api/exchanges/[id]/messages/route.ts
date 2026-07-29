import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exchange from '@/models/Exchange';
import { isValidObjectId } from '@/lib/validation';
import User from '@/models/User';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    if (!isValidObjectId(params.id)) {
      return createApiErrorResponse('Invalid exchange ID', 400);
    }

    await connectDB();

    const exchange = await Exchange.findById(params.id)
      .populate('offeredBy', 'name email')
      .populate('requestedBy', 'name email');

    if (!exchange) {
      return createApiErrorResponse('Exchange not found', 404);
    }

    // Check if user is a participant (either offeredBy or requestedBy)
    if (exchange.offeredBy._id.toString() !== session.user.id && exchange.requestedBy._id.toString() !== session.user.id) {
      return createApiErrorResponse('Forbidden', 403);
    }

    // Populate sender information for embedded messages
    const messagesWithSenders = await Promise.all(
      exchange.messages.map(async (msg: any) => {
        const sender = await User.findById(msg.sender).select('name email');
        return {
          ...(msg as any)._doc,
          sender: sender ? { _id: sender._id, name: sender.name, email: sender.email } : null
        };
      })
    );

    return createApiResponse(messagesWithSenders);
  } catch (error) {
    logError(error, { action: 'fetch_messages', userId: session?.user?.id, exchangeId: params.id });
    return createApiErrorResponse('Failed to fetch messages');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    if (!isValidObjectId(params.id)) {
      return createApiErrorResponse('Invalid exchange ID', 400);
    }

    const { content, type = 'text' } = await request.json();

    if (!content || content.trim().length === 0) {
      return createApiErrorResponse('Message content is required', 400);
    }

    await connectDB();

    const exchange = await Exchange.findById(params.id);

    if (!exchange) {
      return createApiErrorResponse('Exchange not found', 404);
    }

    // Check if user is a participant (either offeredBy or requestedBy)
    if (exchange.offeredBy.toString() !== session.user.id && exchange.requestedBy.toString() !== session.user.id) {
      return createApiErrorResponse('Forbidden', 403);
    }

    // Add message
    const message = {
      sender: session.user.id,
      content: content.trim(),
      type,
      readBy: [{
        user: session.user.id,
        readAt: new Date(),
      }],
    };

    exchange.messages.push(message);
    await exchange.save();

    // Get sender info for response
    const sender = await User.findById(session.user.id).select('name email');
    const newMessage = {
      ...(exchange.messages[exchange.messages.length - 1] as any)._doc,
      sender: sender ? { _id: sender._id, name: sender.name, email: sender.email } : null
    };
    
    return createApiResponse(newMessage, 201);
  } catch (error) {
    logError(error, { action: 'send_message', userId: session?.user?.id, exchangeId: params.id });
    return createApiErrorResponse('Failed to send message');
  }
}
