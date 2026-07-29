import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IBadge {
  name: string;
  description: string;
  icon: string;
  category: 'exchange' | 'community' | 'achievement' | 'special';
  criteria: {
    type: 'exchanges_completed' | 'exchanges_taught' | 'exchanges_learned' | 'group_events' | 'posts_created' | 'upvotes_received' | 'days_active' | 'rating_achieved' | 'login_streak' | 'exchange_streak';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BadgeSchema = new Schema<IBadge>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  description: {
    type: String,
    required: true,
    maxlength: 200,
  },
  icon: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['exchange', 'community', 'achievement', 'special'],
  },
  criteria: {
    type: {
      type: String,
      required: true,
      enum: ['exchanges_completed', 'exchanges_taught', 'exchanges_learned', 'group_events', 'posts_created', 'upvotes_received', 'days_active', 'rating_achieved', 'login_streak', 'exchange_streak'],
    },
    value: {
      type: Number,
      required: true,
      min: 1,
    },
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'all_time'],
      default: 'all_time',
    },
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 1000,
  },
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
BadgeSchema.index({ category: 1 });
BadgeSchema.index({ rarity: 1 });
BadgeSchema.index({ isActive: 1 });

export type BadgeDocument = HydratedDocument<IBadge>;

const Badge: Model<IBadge> = mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema);

export default Badge;
