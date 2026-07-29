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

    const { title, url, issuer, dateObtained } = await request.json();

    if (!title || !title.trim()) {
      return createApiErrorResponse('Certificate title is required', 400);
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $push: {
          certificates: {
            title: title.trim(),
            url: url?.trim() || null,
            issuer: issuer?.trim() || null,
            dateObtained: dateObtained ? new Date(dateObtained) : null,
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    )
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .populate('exchanges');

    if (!user) {
      return createApiErrorResponse('User not found', 404);
    }

    return createApiResponse(user, 201);
  } catch (error) {
    logError(error, { action: 'add_certificate', userId: session?.user?.id });
    return createApiErrorResponse('Failed to add certificate');
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
    const index = parseInt(searchParams.get('index') || '-1', 10);

    if (index < 0) {
      return createApiErrorResponse('Invalid certificate index', 400);
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return createApiErrorResponse('User not found', 404);
    }

    if (!user.certificates || index >= user.certificates.length) {
      return createApiErrorResponse('Certificate not found', 404);
    }

    // Remove the certificate at the specified index
    user.certificates.splice(index, 1);
    await user.save();

    // Repopulate for response
    await user.populate('skillsToTeach');
    await user.populate('skillsToLearn');
    await user.populate('exchanges');

    return createApiResponse(user);
  } catch (error) {
    logError(error, { action: 'delete_certificate', userId: session?.user?.id });
    return createApiErrorResponse('Failed to delete certificate');
  }
}
