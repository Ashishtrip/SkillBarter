import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAnalytics, getSkillAnalytics, getUserAnalytics } from '@/lib/analytics';
import { cache } from '@/lib/cache';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    // Check if user is admin (implement proper admin check)
    const isAdmin = false; // Implement admin check logic

    if (!isAdmin) {
      return createApiErrorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') as 'week' | 'month' | 'year' || 'month';
    const type = searchParams.get('type') || 'general';

    // Check cache first
    const cacheKey = `analytics:${type}:${timeframe}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return createApiResponse(cached);
    }

    let data;

    switch (type) {
      case 'general':
        data = await getAnalytics(timeframe);
        break;
      case 'skill':
        const skillId = searchParams.get('skillId');
        if (!skillId) {
          return createApiErrorResponse('Skill ID is required', 400);
        }
        data = await getSkillAnalytics(skillId);
        break;
      case 'user':
        const userId = searchParams.get('userId') || session.user.id;
        data = await getUserAnalytics(userId);
        break;
      default:
        return createApiErrorResponse('Invalid analytics type', 400);
    }

    // Cache for 5 minutes
    cache.set(cacheKey, data, 300);

    return createApiResponse(data);
  } catch (error) {
    logError(error, { action: 'fetch_analytics', userId: session?.user?.id });
    return createApiErrorResponse('Failed to fetch analytics');
  }
}
