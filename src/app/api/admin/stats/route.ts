import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin, getAdminStats } from '@/lib/admin';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Authentication required', 401);
    }

    const userIsAdmin = await isAdmin(session.user.id);
    if (!userIsAdmin) {
      return createApiErrorResponse('Admin access required', 403);
    }

    const stats = await getAdminStats();
    return createApiResponse(stats);
  } catch (error) {
    logError(error, { action: 'get_admin_stats' });
    return createApiErrorResponse('Failed to fetch admin statistics');
  }
}

