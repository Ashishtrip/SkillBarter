import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import type { Notification as INotification } from '@/types';

export interface CreateNotificationData {
  userId: string;
  type: 'exchange_request' | 'exchange_accepted' | 'exchange_completed' | 'message' | 'group_invite' | 'badge_earned' | 'content_liked' | 'content_comment' | 'group_event' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
}
export async function createNotification(data: CreateNotificationData): Promise<INotification | null> {
  try {
    await connectDB();
    const notification = new Notification({
      user: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      priority: data.priority || 'medium',
      expiresAt: data.expiresAt,
    });

    const saved = await notification.save();

    // Send email notification if user has email notifications enabled
    await sendEmailNotification(data.userId, (saved as any).toObject() as Partial<INotification> & { _id: any });

    return saved as unknown as INotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function getUserNotifications(userId: string, limit = 20, skip = 0): Promise<INotification[]> {
  try {
    await connectDB();
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return notifications as unknown as INotification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<INotification | null> {
  try {
    await connectDB();
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    return notification as unknown as INotification | null;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    await connectDB();

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    await connectDB();

    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}
async function sendEmailNotification(userId: string, notification: Partial<INotification> & { _id: any }) {
  try {
    // Check if user has email notifications enabled
    const user = await User.findById(userId).select('email emailNotifications');
    
    if (!user || !user.email || user.emailNotifications === false) {
      return;
    }

    // Here you would integrate with an email service like SendGrid, Nodemailer, etc.
    // For now, we'll just log the notification
    console.log(`Email notification for ${user.email}: ${notification.title} - ${notification.message}`);
    
    // Mark as email sent
    await Notification.findByIdAndUpdate(notification._id, { isEmailSent: true });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// Notification templates
export const notificationTemplates = {
  exchange_request: (senderName: string, skillName: string) => ({
    title: 'New Exchange Request',
    message: `${senderName} wants to exchange skills with you: ${skillName}`,
  }),
  
  exchange_accepted: (senderName: string) => ({
    title: 'Exchange Accepted',
    message: `${senderName} accepted your exchange request!`,
  }),
  
  exchange_completed: (senderName: string) => ({
    title: 'Exchange Completed',
    message: `Your exchange with ${senderName} has been completed. Don't forget to leave feedback!`,
  }),
  
  message: (senderName: string, groupName?: string) => ({
    title: 'New Message',
    message: groupName 
      ? `${senderName} sent a message in ${groupName}`
      : `${senderName} sent you a message`,
  }),
  
  group_invite: (groupName: string, inviterName: string) => ({
    title: 'Group Invitation',
    message: `${inviterName} invited you to join ${groupName}`,
  }),
  
  badge_earned: (badgeName: string) => ({
    title: 'Badge Earned!',
    message: `Congratulations! You earned the "${badgeName}" badge.`,
  }),
  
  content_liked: (contentTitle: string, likerName: string) => ({
    title: 'Content Liked',
    message: `${likerName} liked your content: ${contentTitle}`,
  }),
  
  content_comment: (contentTitle: string, commenterName: string) => ({
    title: 'New Comment',
    message: `${commenterName} commented on your content: ${contentTitle}`,
  }),
  
  group_event: (eventTitle: string, groupName: string) => ({
    title: 'New Group Event',
    message: `New event "${eventTitle}" in ${groupName}`,
  }),
};
