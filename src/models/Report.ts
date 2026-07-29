import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IReport {
  reporter: mongoose.Types.ObjectId;
  reportedUser?: mongoose.Types.ObjectId;
  reportedContent?: mongoose.Types.ObjectId;
  reportedExchange?: mongoose.Types.ObjectId;
  reportedGroup?: mongoose.Types.ObjectId;
  reportType: 'user' | 'content' | 'exchange' | 'group' | 'message';
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'scam' | 'other';
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminNotes?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReportSchema = new Schema<IReport>({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reportedContent: {
    type: Schema.Types.ObjectId,
    ref: 'Content',
  },
  reportedExchange: {
    type: Schema.Types.ObjectId,
    ref: 'Exchange',
  },
  reportedGroup: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
  reportType: {
    type: String,
    required: true,
    enum: ['user', 'content', 'exchange', 'group', 'message'],
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'scam', 'other'],
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  adminNotes: {
    type: String,
    maxlength: 1000,
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
ReportSchema.index({ status: 1, priority: -1, createdAt: -1 });
ReportSchema.index({ reporter: 1 });
ReportSchema.index({ reportedUser: 1 });
ReportSchema.index({ reportType: 1 });

export type ReportDocument = HydratedDocument<IReport>;

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
