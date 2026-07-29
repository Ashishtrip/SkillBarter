import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface ISkill {
  name: string;
  category: string;
  description?: string;
  level: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const SkillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['tech', 'music', 'languages', 'academics', 'management', 'arts', 'sports', 'cooking', 'crafts', 'other'],
  },
  description: {
    type: String,
    maxlength: 200,
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for search functionality
SkillSchema.index({ name: 'text', description: 'text', tags: 'text' });
SkillSchema.index({ category: 1 });
SkillSchema.index({ level: 1 });

export type SkillDocument = HydratedDocument<ISkill>;

const Skill: Model<ISkill> = mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);

export default Skill;

