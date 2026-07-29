import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Badge from '@/models/Badge';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');

    await connectDB();

    let query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (rarity) {
      query.rarity = rarity;
    }

    const badges = await Badge.find(query).sort({ points: 1 });

    return createApiResponse(badges);
  } catch (error) {
    logError(error, { action: 'fetch_badges' });
    return createApiErrorResponse('Failed to fetch badges');
  }
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const { name, description, icon, category, criteria, points, rarity } = await request.json();

    if (!name || !description || !icon || !category || !criteria || !points || !rarity) {
      return createApiErrorResponse('All fields are required', 400);
    }

    await connectDB();

    const badge = new Badge({
      name,
      description,
      icon,
      category,
      criteria,
      points,
      rarity,
    });

    await badge.save();

    return createApiResponse(badge, 201);
  } catch (error) {
    logError(error, { action: 'create_badge', userId: session?.user?.id });
    return createApiErrorResponse('Failed to create badge');
  }
}
