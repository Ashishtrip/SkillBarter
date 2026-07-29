import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IFeedback {
  exchange: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  rating: number;
  review: string;
  skills: {
    taught: mongoose.Types.ObjectId;
    learned: mongoose.Types.ObjectId;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  exchange: {
    type: Schema.Types.ObjectId,
    ref: 'Exchange',
    required: true,
  },
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: true,
    maxlength: 500,
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
}, {
  timestamps: true,
});

// Ensure one feedback per exchange per reviewer
FeedbackSchema.index({ exchange: 1, reviewer: 1 }, { unique: true });

// Index for finding feedback by reviewee
FeedbackSchema.index({ reviewee: 1 });

export type FeedbackDocument = HydratedDocument<IFeedback>;

const Feedback: Model<IFeedback> = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;

