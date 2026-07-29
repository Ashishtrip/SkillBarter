import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSkillRecommendations, getUserRecommendations, getContentRecommendations } from '@/lib/recommendations';
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Check cache first
    const cacheKey = `recommendations:${session.user.id}:${type}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return createApiResponse(cached);
    }

    let recommendations: any = {};

    switch (type) {
      case 'skills':
        recommendations.skills = await getSkillRecommendations(session.user.id, limit);
        break;
      case 'users':
        recommendations.users = await getUserRecommendations(session.user.id, limit);
        break;
      case 'content':
        recommendations.content = await getContentRecommendations(session.user.id, limit);
        break;
      case 'all':
      default:
        const [skills, users, content] = await Promise.all([
          getSkillRecommendations(session.user.id, Math.ceil(limit / 3)),
          getUserRecommendations(session.user.id, Math.ceil(limit / 3)),
          getContentRecommendations(session.user.id, Math.ceil(limit / 3)),
        ]);
        recommendations = { skills, users, content };
        break;
    }

    // Cache for 10 minutes
    cache.set(cacheKey, recommendations, 600);

    return createApiResponse(recommendations);
  } catch (error) {
    logError(error, { action: 'fetch_recommendations', userId: session?.user?.id });
    return createApiErrorResponse('Failed to fetch recommendations');
  }
}
