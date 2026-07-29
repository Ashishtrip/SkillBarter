import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';
import { sanitizeSearchQuery } from '@/lib/sanitize';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectDB();

    let pipeline: any[] = [];

    // Search filter
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      if (sanitizedSearch) {
        pipeline.push({
          $search: {
            index: 'groups_search', // Assumes an Atlas Search index named 'groups_search'
            text: {
              query: sanitizedSearch,
              path: ['name', 'description', 'tags'],
              fuzzy: {
                maxEdits: 2,
                prefixLength: 2,
              },
            },
          },
        });
      }
    }
    
    let matchStage: any = { isPublic: true };

    // Category filter
    if (category) {
      matchStage.category = category;
    }

    pipeline.push({ $match: matchStage });

    const groups = await Group.aggregate(pipeline)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // We need to get the total count for pagination separately
    const totalPipeline = [...pipeline];
    totalPipeline.push({ $count: 'total' });
    const totalResult = await Group.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
    // The aggregation pipeline doesn't automatically populate referenced fields.
    // If population is needed, we may need to add $lookup stages to the pipeline.
    // For now, we are fetching without population to keep it simple.

    return createApiResponse({
      groups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error, { action: 'fetch_groups' });
    return createApiErrorResponse('Failed to fetch groups');
  }
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sanitizeString } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const { name, description, category, tags, isPublic, maxMembers, rules } = await request.json();

    // Sanitize inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedDescription = sanitizeString(description);
    const sanitizedTags = tags?.map((tag: string) => sanitizeString(tag)).filter(Boolean) || [];
    const sanitizedRules = rules?.map((rule: string) => sanitizeString(rule)).filter(Boolean) || [];

    if (!sanitizedName || !sanitizedDescription || !category) {
      return createApiErrorResponse(
        'Name, description, and category are required',
        400
      );
    }

    await connectDB();

    const group = new Group({
      name: sanitizedName,
      description: sanitizedDescription,
      category,
      tags: sanitizedTags,
      createdBy: session.user.id,
      members: [session.user.id], // Creator is automatically a member
      moderators: [session.user.id], // Creator is automatically a moderator
      isPublic: isPublic !== false,
      maxMembers,
      rules: sanitizedRules,
      events: [],
      posts: [],
    });

    await group.save();

    // Add group to user's groups
    const User = (await import('@/models/User')).default;
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { groups: group._id }
    });

    return createApiResponse(group, 201);
  } catch (error) {
    logError(error, { action: 'create_group', userId: session?.user?.id });
    return createApiErrorResponse('Failed to create group');
  }
}
