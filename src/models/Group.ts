import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IGroup {
  name: string;
  description: string;
  category: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  moderators: mongoose.Types.ObjectId[];
  isPublic: boolean;
  maxMembers?: number;
  rules: string[];
  events: mongoose.Types.ObjectId[];
  posts: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  category: {
    type: String,
    required: true,
    enum: ['tech', 'music', 'languages', 'academics', 'management', 'arts', 'sports', 'cooking', 'crafts', 'other'],
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20,
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  maxMembers: {
    type: Number,
    min: 2,
    max: 1000,
  },
  rules: [{
    type: String,
    maxlength: 200,
  }],
  events: [{
    type: Schema.Types.ObjectId,
    ref: 'GroupEvent',
  }],
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'GroupPost',
  }],
}, {
  timestamps: true,
});

// Indexes for search and filtering
GroupSchema.index({ name: 'text', description: 'text', tags: 'text' });
GroupSchema.index({ category: 1 });
GroupSchema.index({ isPublic: 1 });
GroupSchema.index({ createdBy: 1 });

export type GroupDocument = HydratedDocument<IGroup>;

const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);

export default Group;

