import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { isValidObjectId } from '@/lib/validation';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function GET() {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isValidObjectId(session.user.id)) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .populate('exchanges');

    if (!user) {
      return createApiErrorResponse('User not found', 404);
    }

    return createApiResponse(user);
  } catch (error) {
    logError(error, { action: 'fetch_user_profile', userId: session?.user?.id });
    return createApiErrorResponse('Failed to fetch user profile');
  }
}

export async function PUT(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isValidObjectId(session.user.id)) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const { name, bio, location, githubProfile, linkedinProfile } = await request.json();

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name, bio, location, githubProfile, linkedinProfile },
      { new: true, runValidators: true }
    ).populate('skillsToTeach')
     .populate('skillsToLearn')
     .populate('exchanges');

    if (!user) {
      return createApiErrorResponse('User not found', 404);
    }

    return createApiResponse(user);
  } catch (error) {
    logError(error, { action: 'update_user_profile', userId: session?.user?.id });
    return createApiErrorResponse('Failed to update user profile');
  }
}
