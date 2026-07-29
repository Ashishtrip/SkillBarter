'use client';

import Image from 'next/image';
import { MessageCircle, Share, Heart, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Author {
  id: string;
  name: string;
  avatar?: string;
}

interface FeedPostProps {
  id: string;
  author: Author;
  title: string;
  content: string;
  image?: string;
  community?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onMenuOpen?: () => void;
}

export function FeedPost({
  id,
  author,
  title,
  content,
  image,
  community,
  timestamp,
  likes,
  comments,
  shares = 0,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  onMenuOpen,
}: FeedPostProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onLike?.();
  };

  return (
    <div className="feed-post">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="feed-post-header flex-1">
          {/* Author Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-primary-600">{author.name.charAt(0)}</span>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1">
            <p className="feed-post-author">{author.name}</p>
            <div className="flex items-center gap-2">
              {community && <span className="text-xs text-secondary-500 font-medium">in {community}</span>}
              <span className="feed-post-meta">• {timestamp}</span>
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <button
          onClick={onMenuOpen}
          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={18} className="text-secondary-500" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-secondary-900 mb-2">{title}</h3>

      {/* Content */}
      <p className="feed-post-content line-clamp-3">{content}</p>

      {/* Image */}
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden bg-secondary-100 aspect-video relative">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Footer - Engagement */}
      <div className="feed-post-footer">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-xs font-medium transition-colors ${
            liked ? 'text-accent-500' : 'text-secondary-600 hover:text-accent-500'
          }`}
        >
          <Heart size={16} className={liked ? 'fill-current' : ''} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={onComment}
          className="flex items-center gap-2 text-xs font-medium text-secondary-600 hover:text-primary-600 transition-colors"
        >
          <MessageCircle size={16} />
          <span>{comments}</span>
        </button>

        {shares > 0 && (
          <button
            onClick={onShare}
            className="flex items-center gap-2 text-xs font-medium text-secondary-600 hover:text-primary-600 transition-colors"
          >
            <Share size={16} />
            <span>{shares}</span>
          </button>
        )}
      </div>
    </div>
  );
}
