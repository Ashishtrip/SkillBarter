import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IGroupEvent {
  group: mongoose.Types.ObjectId;
  title: string;
  description: string;
  eventType: 'barter' | 'workshop' | 'discussion' | 'meetup';
  host: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  maxParticipants?: number;
  skills: {
    taught: mongoose.Types.ObjectId;
    learned: mongoose.Types.ObjectId;
  };
  scheduledFor: Date;
  duration: number; // in minutes
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

const GroupEventSchema = new Schema<IGroupEvent>({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  eventType: {
    type: String,
    required: true,
    enum: ['barter', 'workshop', 'discussion', 'meetup'],
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxParticipants: {
    type: Number,
    min: 2,
    max: 100,
  },
  skills: {
    taught: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    learned: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
  },
  scheduledFor: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480, // 8 hours max
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  meetingLink: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

// Indexes
GroupEventSchema.index({ group: 1, scheduledFor: 1 });
GroupEventSchema.index({ host: 1 });
GroupEventSchema.index({ status: 1 });
GroupEventSchema.index({ scheduledFor: 1 });

export type GroupEventDocument = HydratedDocument<IGroupEvent>;

const GroupEvent: Model<IGroupEvent> = mongoose.models.GroupEvent || mongoose.model<IGroupEvent>('GroupEvent', GroupEventSchema);

export default GroupEvent;

