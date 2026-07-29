import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import { sanitizeSearchQuery } from '@/lib/sanitize';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const contentType = searchParams.get('contentType');
    const difficulty = searchParams.get('difficulty');
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
            index: 'content_search', // Assumes an Atlas Search index named 'content_search'
            text: {
              query: sanitizedSearch,
              path: ['title', 'content', 'tags'],
              fuzzy: {
                maxEdits: 2,
                prefixLength: 2,
              },
            },
          },
        });
      }
    }

    let matchStage: any = { 
      status: 'published',
      isPublic: true 
    };
    
    // Category filter
    if (category) {
      matchStage.category = category;
    }

    // Content type filter
    if (contentType) {
      matchStage.contentType = contentType;
    }

    // Difficulty filter
    if (difficulty) {
      matchStage.difficulty = difficulty;
    }

    pipeline.push({ $match: matchStage });

    const content = await Content.aggregate(pipeline)
      .sort({ publishedAt: -1, upvotes: -1 })
      .skip(skip)
      .limit(limit);

    const totalPipeline = [...pipeline];
    totalPipeline.push({ $count: 'total' });
    const totalResult = await Content.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
    // The aggregation pipeline doesn't automatically populate referenced fields.
    // If population is needed, we may need to add $lookup stages to the pipeline.

    return createApiResponse({
      content: content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error, { action: 'fetch_content' });
    return createApiErrorResponse('Failed to fetch content');
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

    const { 
      title, 
      content, 
      contentType, 
      category, 
      tags, 
      difficulty, 
      estimatedTime, 
      skills, 
      collaborators,
      isPublic = true 
    } = await request.json();

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedContent = sanitizeString(content);
    const sanitizedTags = tags?.map((tag: string) => sanitizeString(tag)).filter(Boolean) || [];

    if (!sanitizedTitle || !sanitizedContent || !contentType || !category || !difficulty || !estimatedTime) {
      return createApiErrorResponse('Required fields are missing', 400);
    }

    await connectDB();

    const contentDoc = new Content({
      author: session.user.id,
      title: sanitizedTitle,
      content: sanitizedContent,
      contentType,
      category,
      tags: sanitizedTags,
      difficulty,
      estimatedTime,
      skills: skills || [],
      collaborators: collaborators || [],
      isPublic,
      status: 'published',
      publishedAt: new Date(),
    });

    await contentDoc.save();

    // Populate for response
    await contentDoc.populate('author', 'name email');
    await contentDoc.populate('skills', 'name category level');

    return createApiResponse(contentDoc, 201);
  } catch (error) {
    logError(error, { action: 'create_content', userId: session?.user?.id });
    return createApiErrorResponse('Failed to create content');
  }
}
