import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserNotifications, markAllNotificationsAsRead, getUnreadNotificationCount } from '@/lib/notifications';
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const notifications = await getUserNotifications(session.user.id, limit, skip);
    const unreadCount = await getUnreadNotificationCount(session.user.id);

    return createApiResponse({
      notifications,
      unreadCount,
    });
  } catch (error) {
    logError(error, { action: 'fetch_notifications', userId: session?.user?.id });
    return createApiErrorResponse('Failed to fetch notifications');
  }
}

export async function PATCH(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const { action } = await request.json();

    if (action === 'mark_all_read') {
      await markAllNotificationsAsRead(session.user.id);
      return createApiResponse({ message: 'All notifications marked as read' });
    }

    return createApiErrorResponse('Invalid action', 400);
  } catch (error) {
    logError(error, { action: 'update_notifications', userId: session?.user?.id });
    return createApiErrorResponse('Failed to update notifications');
  }
}
