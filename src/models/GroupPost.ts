import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IComment {
  author: mongoose.Types.ObjectId;
  content: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGroupPost {
  group: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  postType: 'discussion' | 'tutorial' | 'resource' | 'project' | 'announcement';
  tags: string[];
  attachments: {
    type: 'image' | 'document' | 'link';
    url: string;
    filename?: string;
  }[];
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  comments: IComment[];
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CommentDocument = HydratedDocument<IComment>;
export type GroupPostDocument = HydratedDocument<IGroupPost>;

const CommentSchema = new Schema<IComment>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

const GroupPostSchema = new Schema<IGroupPost>({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  postType: {
    type: String,
    required: true,
    enum: ['discussion', 'tutorial', 'resource', 'project', 'announcement'],
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20,
  }],
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'link'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      trim: true,
    },
  }],
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [CommentSchema],
  isPinned: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
GroupPostSchema.index({ group: 1, createdAt: -1 });
GroupPostSchema.index({ author: 1 });
GroupPostSchema.index({ postType: 1 });
GroupPostSchema.index({ isPinned: 1, createdAt: -1 });
GroupPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

const GroupPost: Model<IGroupPost> = mongoose.models.GroupPost || mongoose.model<IGroupPost>('GroupPost', GroupPostSchema);

export default GroupPost;

