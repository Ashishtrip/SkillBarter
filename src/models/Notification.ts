import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface INotification {
  user: mongoose.Types.ObjectId;
  type: 'exchange_request' | 'exchange_accepted' | 'exchange_completed' | 'message' | 'group_invite' | 'badge_earned' | 'content_liked' | 'content_comment' | 'group_event' | 'system';
  title: string;
  message: string;
  data: {
    exchangeId?: mongoose.Types.ObjectId;
    groupId?: mongoose.Types.ObjectId;
    contentId?: mongoose.Types.ObjectId;
    badgeId?: mongoose.Types.ObjectId;
    eventId?: mongoose.Types.ObjectId;
    senderId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  isRead: boolean;
  isEmailSent: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['exchange_request', 'exchange_accepted', 'exchange_completed', 'message', 'group_invite', 'badge_earned', 'content_liked', 'content_comment', 'group_event', 'system'],
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isEmailSent: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type NotificationDocument = HydratedDocument<INotification>;

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;

