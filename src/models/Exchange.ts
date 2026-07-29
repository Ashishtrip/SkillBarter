import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'system' | 'exchange_request' | 'exchange_accepted' | 'exchange_declined' | 'exchange_completed' | 'video_call';
  videoCall?: {
    room: string;
  };
  readBy: Array<{
    user: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExchange {
  offeredBy: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  skills: {
    offered: mongoose.Types.ObjectId;
    requested: mongoose.Types.ObjectId;
  };
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  messages: IMessage[];
  scheduledFor?: Date;
  completedAt?: Date;
  startTime?: Date;
  endTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MessageDocument = HydratedDocument<IMessage>;
export type ExchangeDocument = HydratedDocument<IExchange>;

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  type: {
    type: String,
    enum: ['text', 'system', 'exchange_request', 'exchange_accepted', 'exchange_declined', 'exchange_completed', 'video_call'],
    default: 'text',
  },
  videoCall: {
    room: {
      type: String,
    },
  },
  readBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

const ExchangeSchema = new Schema<IExchange>({
  offeredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skills: {
    offered: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    requested: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  messages: [MessageSchema],
  scheduledFor: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for common queries
ExchangeSchema.index({ offeredBy: 1 });
ExchangeSchema.index({ requestedBy: 1 });
ExchangeSchema.index({ status: 1 });
ExchangeSchema.index({ offeredBy: 1, status: 1 });
ExchangeSchema.index({ requestedBy: 1, status: 1 });
ExchangeSchema.index({ createdAt: -1 });

const Exchange: Model<IExchange> = mongoose.models.Exchange || mongoose.model<IExchange>('Exchange', ExchangeSchema);

export default Exchange;

