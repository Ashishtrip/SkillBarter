import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IUserBadge {
  user: mongoose.Types.ObjectId;
  badge: mongoose.Types.ObjectId;
  earnedAt: Date;
  progress: number; // 0-100, for progress tracking
  isDisplayed: boolean; // whether to show on profile
  createdAt?: Date;
  updatedAt?: Date;
}

const UserBadgeSchema = new Schema<IUserBadge>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badge: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isDisplayed: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Ensure unique user-badge combination
UserBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });
UserBadgeSchema.index({ user: 1, earnedAt: -1 });
UserBadgeSchema.index({ badge: 1 });

export type UserBadgeDocument = HydratedDocument<IUserBadge>;

const UserBadge: Model<IUserBadge> = mongoose.models.UserBadge || mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);

export default UserBadge;

