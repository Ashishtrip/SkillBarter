export interface User {
  _id: string;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  avatar?: string;
  image?: string;
  identityVerified?: boolean;
  identityVerificationMethod?: 'manual' | 'social';
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
  skillsToTeach: Skill[];
  skillsToLearn: Skill[];
  exchanges: Exchange[];
  averageRating: number;
  totalReviews: number;
  points: number;
  level: number;
  badges: UserBadge[];
  groups: Group[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  _id: string;
  name: string;
  category: SkillCategory;
  description?: string;
  level: SkillLevel;
  tags: string[];
}

export interface Exchange {
  _id?: string;
  offeredBy: string | User; // User ID or User object
  requestedBy: string | User; // User ID or User object
  skills: {
    offered: string | Skill; // Skill ID or Skill object
    requested: string | Skill; // Skill ID or Skill object
  };
  status: ExchangeStatus;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
  scheduledFor?: Date;
  completedAt?: Date;
}

export interface Message {
  _id: string;
  sender: string | { _id: string; name: string; email: string };
  content: string;
  timestamp?: Date;
  createdAt: Date;
  type: 'text' | 'system' | 'exchange_request' | 'exchange_accepted' | 'exchange_declined' | 'exchange_completed' | 'video_call';
  videoCall?: {
    room: string;
  };
}

export type SkillCategory = 
  | 'tech'
  | 'music'
  | 'languages'
  | 'academics'
  | 'management'
  | 'arts'
  | 'sports'
  | 'cooking'
  | 'crafts'
  | 'other';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ExchangeStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface SearchFilters {
  category?: SkillCategory;
  level?: SkillLevel;
  location?: string;
  searchTerm?: string;
  skillType?: 'teach' | 'learn';
  minRating?: number;
}

export interface Feedback {
  _id: string;
  exchange: string;
  reviewer: string;
  reviewee: string;
  rating: number;
  review: string;
  skills: {
    taught: string;
    learned: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  category: SkillCategory;
  tags: string[];
  createdBy: string;
  members: User[];
  moderators: User[];
  isPublic: boolean;
  maxMembers?: number;
  rules: string[];
  events: GroupEvent[];
  posts: GroupPost[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupEvent {
  _id: string;
  group: string;
  title: string;
  description: string;
  eventType: 'barter' | 'workshop' | 'discussion' | 'meetup';
  host: string;
  participants: string[];
  maxParticipants?: number;
  skills: {
    taught: string;
    learned: string;
  };
  scheduledFor: Date;
  duration: number;
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupPost {
  _id: string;
  group: string;
  author: string;
  title: string;
  content: string;
  postType: 'discussion' | 'tutorial' | 'resource' | 'project' | 'announcement';
  tags: string[];
  attachments: {
    type: 'image' | 'document' | 'link';
    url: string;
    filename?: string;
  }[];
  upvotes: string[];
  downvotes: string[];
  comments: Comment[];
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  author: string;
  content: string;
  upvotes: string[];
  downvotes: string[];
  replies: Reply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reply {
  _id: string;
  author: string;
  content: string;
  upvotes: string[];
  downvotes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exchange' | 'community' | 'achievement' | 'special';
  criteria: {
    type: 'exchanges_completed' | 'exchanges_taught' | 'exchanges_learned' | 'group_events' | 'posts_created' | 'upvotes_received' | 'days_active' | 'rating_achieved';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBadge {
  _id: string;
  user: string;
  badge: Badge;
  earnedAt: Date;
  progress: number;
  isDisplayed: boolean;
}

export interface Content {
  _id: string;
  author: string;
  title: string;
  content: string;
  contentType: 'tutorial' | 'resource' | 'project' | 'article';
  category: SkillCategory;
  tags: string[];
  attachments: {
    type: 'image' | 'document' | 'video' | 'link';
    url: string;
    filename?: string;
    size?: number;
  }[];
  upvotes: string[];
  downvotes: string[];
  comments: Comment[];
  views: number;
  isPublic: boolean;
  isFeatured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  skills: string[];
  collaborators: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  user: string;
  type: 'exchange_request' | 'exchange_accepted' | 'exchange_completed' | 'message' | 'group_invite' | 'badge_earned' | 'content_liked' | 'content_comment' | 'group_event' | 'system';
  title: string;
  message: string;
  data: {
    exchangeId?: string;
    groupId?: string;
    contentId?: string;
    badgeId?: string;
    eventId?: string;
    senderId?: string;
    [key: string]: any;
  };
  isRead: boolean;
  isEmailSent: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  _id: string;
  reporter: string;
  reportedUser?: string;
  reportedContent?: string;
  reportedExchange?: string;
  reportedGroup?: string;
  reportType: 'user' | 'content' | 'exchange' | 'group' | 'message';
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'scam' | 'other';
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
