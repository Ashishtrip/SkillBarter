import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { isValidObjectId } from '@/lib/validation';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id || !isValidObjectId(session.user.id)) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const { jobTitle, company, description, startYear, endYear, currentlyWorking } = await request.json();

    if (!jobTitle || !company) {
      return createApiErrorResponse('Job title and company are required', 400);
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return createApiErrorResponse('User not found', 404);
    }

    // Add work experience entry
    if (!user.workExperience) {
      user.workExperience = [];
    }

    user.workExperience.push({
      jobTitle,
      company,
      description: description || '',
      startYear: parseInt(startYear),
      endYear: currentlyWorking ? undefined : parseInt(endYear),
      currentlyWorking: currentlyWorking || false,
      createdAt: new Date(),
    });

    await user.save();

    // Populate relations for response
    const populatedUser = await User.findById(session.user.id)
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .populate('exchanges');

    return createApiResponse(populatedUser, 201);
  } catch (error) {
    logError(error, { action: 'add_work_experience', userId: session?.user?.id });
    return createApiErrorResponse('Failed to add work experience');
  }
}

export async function DELETE(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id || !isValidObjectId(session.user.id)) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const index = parseInt(searchParams.get('index') || '-1');

    if (index < 0) {
      return createApiErrorResponse('Invalid index', 400);
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return createApiErrorResponse('User not found', 404);
    }

    if (!user.workExperience || index >= user.workExperience.length) {
      return createApiErrorResponse('Work experience entry not found', 404);
    }

    // Remove work experience entry at index
    user.workExperience.splice(index, 1);

    await user.save();

    // Populate relations for response
    const populatedUser = await User.findById(session.user.id)
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .populate('exchanges');

    return createApiResponse(populatedUser);
  } catch (error) {
    logError(error, { action: 'delete_work_experience', userId: session?.user?.id });
    return createApiErrorResponse('Failed to delete work experience');
  }
}
