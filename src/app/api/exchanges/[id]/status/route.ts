import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Exchange from '@/models/Exchange';
import { isValidObjectId } from '@/lib/validation';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function PATCH(
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

    const { status } = await request.json();

    if (!['pending', 'active', 'completed', 'cancelled'].includes(status)) {
      return createApiErrorResponse('Invalid status', 400);
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

    // Validate status transitions
    const currentStatus = exchange.status;
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['active', 'cancelled'],
      'active': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return createApiErrorResponse(
        `Cannot transition from ${currentStatus} to ${status}`,
        400
      );
    }

    // Update status
    exchange.status = status;
    
    if (status === 'completed') {
      exchange.completedAt = new Date();
    }

    // Add system message
    const systemMessages: { [key: string]: string } = {
      'active': 'Exchange has been accepted and is now active!',
      'completed': 'Exchange has been marked as completed. Great work!',
      'cancelled': 'Exchange has been cancelled.'
    };

    const statusToMessageType: { [key: string]: 'exchange_accepted' | 'exchange_completed' | 'system' } = {
      active: 'exchange_accepted',
      completed: 'exchange_completed',
      cancelled: 'system'
    };

    if (systemMessages[status]) {
      exchange.messages.push({
        sender: session.user.id,
        content: systemMessages[status],
        type: statusToMessageType[status],
        readBy: [{
          user: session.user.id,
          readAt: new Date(),
        }],
      });
    }

    await exchange.save();

    // Populate for response
    await exchange.populate('offeredBy', 'name email avatar');
    await exchange.populate('requestedBy', 'name email avatar');
    await exchange.populate('skills.offered', 'name category level');
    await exchange.populate('skills.requested', 'name category level');

    return createApiResponse(exchange);
  } catch (error) {
    logError(error, { action: 'update_exchange_status', userId: session?.user?.id, exchangeId: params.id });
    return createApiErrorResponse('Failed to update exchange status');
  }
}
