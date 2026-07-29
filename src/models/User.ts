import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface IUser {
  email: string;
  name: string;
  password?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  identityVerified?: boolean;
  identityVerificationMethod?: 'manual' | 'social';
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role?: 'user' | 'admin' | 'moderator';
  emailNotifications?: boolean;
  skillsToTeach: mongoose.Types.ObjectId[];
  skillsToLearn: mongoose.Types.ObjectId[];
  exchanges: mongoose.Types.ObjectId[];
  averageRating: number;
  totalReviews: number;
  points: number;
  level: number;
  badges: mongoose.Types.ObjectId[];
  groups: mongoose.Types.ObjectId[];
  lastLogin?: Date;
  loginStreak?: number;
  lastExchange?: Date;
  exchangeStreak?: number;
  githubProfile?: string;
  linkedinProfile?: string;
  certificates?: Array<{
    title?: string;
    url?: string;
    issuer?: string;
    dateObtained?: Date;
    createdAt?: Date;
  }>;
  projects?: Array<{
    title?: string;
    description?: string;
    url?: string;
    techStack?: string[];
    createdAt?: Date;
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
    createdAt?: Date;
  }>;
  workExperience?: Array<{
    jobTitle?: string;
    company?: string;
    description?: string;
    startYear?: number;
    endYear?: number;
    currentlyWorking?: boolean;
    createdAt?: Date;
  }>;
  credit: {
    type: Number,
    default: 0,
  },
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  location: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
  },
  identityVerified: {
    type: Boolean,
    default: false,
  },
  identityVerificationMethod: {
    type: String,
    enum: ['manual', 'social'],
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationExpires: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  skillsToTeach: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill',
  }],
  skillsToLearn: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill',
  }],
  exchanges: [{
    type: Schema.Types.ObjectId,
    ref: 'Exchange',
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100,
  },
  badges: [{
    type: Schema.Types.ObjectId,
    ref: 'UserBadge',
  }],
  groups: [{
    type: Schema.Types.ObjectId,
    ref: 'Group',
  }],
  lastLogin: {
    type: Date,
  },
  loginStreak: {
    type: Number,
    default: 0,
  },
  lastExchange: {
    type: Date,
  },
  exchangeStreak: {
    type: Number,
    default: 0,
  },
  githubProfile: {
    type: String,
    trim: true,
  },
  linkedinProfile: {
    type: String,
    trim: true,
  },
  certificates: [{
    title: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    issuer: {
      type: String,
      trim: true,
    },
    dateObtained: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  projects: [{
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    techStack: [{
      type: String,
      trim: true,
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  education: [{
    school: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      trim: true,
    },
    startYear: {
      type: Number,
    },
    endYear: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  workExperience: [{
    jobTitle: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startYear: {
      type: Number,
    },
    endYear: {
      type: Number,
    },
    currentlyWorking: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for common queries
// Note: email already has an index due to unique: true
UserSchema.index({ location: 1 });
UserSchema.index({ averageRating: -1 });
UserSchema.index({ points: -1 });
UserSchema.index({ skillsToTeach: 1 });
UserSchema.index({ skillsToLearn: 1 });

export type UserDocument = HydratedDocument<IUser>;

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;


