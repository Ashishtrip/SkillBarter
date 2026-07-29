import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IReply {
  author: mongoose.Types.ObjectId;
  content: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IComment {
  author: mongoose.Types.ObjectId;
  content: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  replies: IReply[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContent {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  contentType: 'tutorial' | 'resource' | 'project' | 'article';
  category: string;
  tags: string[];
  attachments: {
    type: 'image' | 'document' | 'video' | 'link';
    url: string;
    filename?: string;
    size?: number;
  }[];
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  comments: IComment[];
  views: number;
  isPublic: boolean;
  isFeatured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  skills: mongoose.Types.ObjectId[];
  collaborators: mongoose.Types.ObjectId[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ReplyDocument = HydratedDocument<IReply>;
export type CommentDocument = HydratedDocument<IComment>;
export type ContentDocument = HydratedDocument<IContent>;

const ReplySchema = new Schema<IReply>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
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
  replies: [ReplySchema],
}, {
  timestamps: true,
});

const ContentSchema = new Schema<IContent>({
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
    maxlength: 10000,
  },
  contentType: {
    type: String,
    required: true,
    enum: ['tutorial', 'resource', 'project', 'article'],
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
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'link'],
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
    size: {
      type: Number,
      min: 0,
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
  views: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 1,
    max: 1440, // 24 hours max
  },
  skills: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill',
  }],
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  publishedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for search and filtering
ContentSchema.index({ title: 'text', content: 'text', tags: 'text' });
ContentSchema.index({ contentType: 1 });
ContentSchema.index({ category: 1 });
ContentSchema.index({ difficulty: 1 });
ContentSchema.index({ author: 1 });
ContentSchema.index({ status: 1, isPublic: 1 });
ContentSchema.index({ publishedAt: -1 });
ContentSchema.index({ upvotes: -1 });

const Content: Model<IContent> = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);

export default Content;


