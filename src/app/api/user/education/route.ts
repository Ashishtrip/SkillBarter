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

    const { school, degree, fieldOfStudy, startYear, endYear } = await request.json();

    if (!school || !degree) {
      return createApiErrorResponse('School and degree are required', 400);
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return createApiErrorResponse('User not found', 404);
    }

    // Add education entry
    if (!user.education) {
      user.education = [];
    }

    user.education.push({
      school,
      degree,
      fieldOfStudy: fieldOfStudy || '',
      startYear: parseInt(startYear),
      endYear: parseInt(endYear),
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
    logError(error, { action: 'add_education', userId: session?.user?.id });
    return createApiErrorResponse('Failed to add education');
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

    if (!user.education || index >= user.education.length) {
      return createApiErrorResponse('Education entry not found', 404);
    }

    // Remove education entry at index
    user.education.splice(index, 1);

    await user.save();

    // Populate relations for response
    const populatedUser = await User.findById(session.user.id)
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .populate('exchanges');

    return createApiResponse(populatedUser);
  } catch (error) {
    logError(error, { action: 'delete_education', userId: session?.user?.id });
    return createApiErrorResponse('Failed to delete education');
  }
}
