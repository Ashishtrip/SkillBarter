import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return Response.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // TODO: Implement saving message to database
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: session.user.id,
      senderName: session.user.name || 'User',
      content: content.trim(),
      timestamp: new Date(),
      isRead: false,
    };

    return Response.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return Response.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
