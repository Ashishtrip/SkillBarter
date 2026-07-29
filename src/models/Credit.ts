import mongoose, { Schema, Document, models } from 'mongoose';

export interface ICredit extends Document {
  user: mongoose.Schema.Types.ObjectId;
  balance: number;
  updatedAt: Date;
}

const CreditSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

const Credit = models.Credit || mongoose.model<ICredit>('Credit', CreditSchema);

export default Credit;
