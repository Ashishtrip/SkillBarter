import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';
import User from '@/models/User';
import { isValidObjectId } from '@/lib/validation';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

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
      return createApiErrorResponse('Invalid group ID', 400);
    }

    await connectDB();

    const group = await Group.findById(params.id);
    if (!group) {
      return createApiErrorResponse('Group not found', 404);
    }

    // Check if user is already a member
    if (group.members.includes(session.user.id)) {
      return createApiErrorResponse('Already a member of this group', 400);
    }

    // Check if group is full
    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return createApiErrorResponse('Group is full', 400);
    }

    // Add user to group
    group.members.push(session.user.id);
    await group.save();

    // Add group to user's groups
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { groups: group._id }
    });

    return createApiResponse({ message: 'Successfully joined group' });
  } catch (error) {
    logError(error, { action: 'join_group', userId: session?.user?.id, groupId: params.id });
    return createApiErrorResponse('Failed to join group');
  }
}

export async function DELETE(
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
      return createApiErrorResponse('Invalid group ID', 400);
    }

    await connectDB();

    const group = await Group.findById(params.id);
    if (!group) {
      return createApiErrorResponse('Group not found', 404);
    }

    // Check if user is a member
    if (!group.members.includes(session.user.id)) {
      return createApiErrorResponse('Not a member of this group', 400);
    }

    // Remove user from group
    group.members = group.members.filter(
      (memberId: any) => memberId.toString() !== session.user.id
    );

    // Remove user from moderators if they were one
    group.moderators = group.moderators.filter(
      (modId: any) => modId.toString() !== session.user.id
    );

    await group.save();

    // Remove group from user's groups
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { groups: group._id }
    });

    return createApiResponse({ message: 'Successfully left group' });
  } catch (error) {
    logError(error, { action: 'leave_group', userId: session?.user?.id, groupId: params.id });
    return createApiErrorResponse('Failed to leave group');
  }
}
