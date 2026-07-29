import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import User from '@/models/User';
import Exchange from '@/models/Exchange';
import { isValidObjectId } from '@/lib/validation';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  let session: any = null;
  let exchangeId: string | undefined;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const { exchangeId, rating, review, skills } = await request.json();

    if (!exchangeId || !rating || !review || !skills?.taught || !skills?.learned) {
      return createApiErrorResponse('Missing required fields', 400);
    }

    if (!isValidObjectId(exchangeId)) {
      return createApiErrorResponse('Invalid exchange ID', 400);
    }

    if (rating < 1 || rating > 5) {
      return createApiErrorResponse('Rating must be between 1 and 5', 400);
    }

    await connectDB();

    // Verify exchange exists and is completed
    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) {
      return createApiErrorResponse('Exchange not found', 404);
    }

    if (exchange.status !== 'completed') {
      return createApiErrorResponse(
        'Can only leave feedback for completed exchanges',
        400
      );
    }

    // Check if user is a participant
    if (!exchange.participants.some((p: any) => p.toString() === session.user.id)) {
      return createApiErrorResponse('Forbidden', 403);
    }

    // Find the other participant
    const otherParticipant = exchange.participants.find(
      (p: any) => p.toString() !== session.user.id
    );

    if (!otherParticipant) {
      return createApiErrorResponse('Other participant not found', 400);
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      exchange: exchangeId,
      reviewer: session.user.id,
    });

    if (existingFeedback) {
      return createApiErrorResponse(
        'Feedback already provided for this exchange',
        400
      );
    }

    // Create feedback
    const feedback = new Feedback({
      exchange: exchangeId,
      reviewer: session.user.id,
      reviewee: otherParticipant,
      rating,
      review: review.trim(),
      skills,
    });

    await feedback.save();

    // Update user's average rating
    await updateUserRating(otherParticipant.toString());

    return createApiResponse(feedback, 201);
  } catch (error) {
    logError(error, { action: 'create_feedback', userId: session?.user?.id, exchangeId });
    return createApiErrorResponse('Failed to create feedback');
  }
}

export async function GET(request: NextRequest) {
  let userId: string | null = null;
  try {
    const { searchParams } = new URL(request.url);
    userId = searchParams.get('userId');

    if (!userId) {
      return createApiErrorResponse('User ID is required', 400);
    }

    if (!isValidObjectId(userId)) {
      return createApiErrorResponse('Invalid user ID', 400);
    }

    await connectDB();

    const feedback = await Feedback.find({ reviewee: userId })
      .populate('reviewer', 'name')
      .populate('skills.taught', 'name category')
      .populate('skills.learned', 'name category')
      .sort({ createdAt: -1 });

    return createApiResponse(feedback);
  } catch (error) {
    logError(error, { action: 'fetch_feedback', userId });
    return createApiErrorResponse('Failed to fetch feedback');
  }
}

async function updateUserRating(userId: string) {
  try {
    const feedbacks = await Feedback.find({ reviewee: userId });
    
    if (feedbacks.length === 0) return;

    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = totalRating / feedbacks.length;

    await User.findByIdAndUpdate(userId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: feedbacks.length,
    });
  } catch (error) {
    logError(error, { action: 'update_user_rating', userId });
  }
}
