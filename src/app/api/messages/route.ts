import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement getting conversations from database
    // This is a stub implementation
    const conversations = [
      {
        id: '1',
        participantId: 'user2',
        participantName: 'John Doe',
        participantAvatar: undefined,
        lastMessage: 'Thanks for the exchange!',
        lastMessageTime: new Date(),
        unreadCount: 0,
        messages: [
          {
            id: 'msg1',
            senderId: 'user2',
            senderName: 'John Doe',
            content: 'Hi, can we exchange skills?',
            timestamp: new Date(),
            isRead: true,
          },
          {
            id: 'msg2',
            senderId: session.user.id,
            senderName: session.user.name || 'You',
            content: 'Sure! I can teach you JavaScript',
            timestamp: new Date(),
            isRead: true,
          },
          {
            id: 'msg3',
            senderId: 'user2',
            senderName: 'John Doe',
            content: 'Thanks for the exchange!',
            timestamp: new Date(),
            isRead: true,
          },
        ],
      },
    ];

    return Response.json(conversations);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
