'use client';

import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  endorsements?: number;
}

interface ProfileCardProps {
  id: string;
  name: string;
  headline?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  skills?: Skill[];
  rating?: number;
  reviews?: number;
  onConnect?: () => void;
  onMessage?: () => void;
  ctaLabel?: string;
  isOwn?: boolean;
}

export function ProfileCard({
  id,
  name,
  headline,
  location,
  bio,
  avatar,
  skills = [],
  rating = 0,
  reviews = 0,
  onConnect,
  onMessage,
  ctaLabel = 'Connect',
  isOwn = false,
}: ProfileCardProps) {
  return (
    <div className="profile-card">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden mx-auto mb-4">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-primary-600">{name.charAt(0)}</span>
        )}
      </div>

      {/* Name & Headline */}
      <h3 className="text-lg font-semibold text-secondary-900 mb-1">{name}</h3>
      {headline && <p className="text-sm text-secondary-600 mb-3">{headline}</p>}

      {/* Location */}
      {location && (
        <div className="flex items-center justify-center gap-1 text-xs text-secondary-500 mb-3">
          <MapPin size={14} />
          <span>{location}</span>
        </div>
      )}

      {/* Bio */}
      {bio && <p className="text-xs text-secondary-600 mb-4 line-clamp-2">{bio}</p>}

      {/* Rating */}
      {rating > 0 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.round(rating) ? 'fill-accent-500 text-accent-500' : 'text-secondary-200'}
              />
            ))}
          </div>
          <span className="text-xs text-secondary-600">
            {rating.toFixed(1)} ({reviews})
          </span>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4 w-full">
          <div className="flex flex-wrap justify-center gap-2">
            {skills.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="badge-primary text-xs py-1 px-2"
              >
                {skill.name}
                {skill.endorsements && <span className="ml-1">+{skill.endorsements}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      {!isOwn && (
        <div className="flex gap-2 w-full mt-4 pt-4 border-t border-secondary-200/60">
          <button
            onClick={onConnect}
            className="flex-1 btn-primary text-sm py-2 px-3"
          >
            {ctaLabel}
          </button>
          {onMessage && (
            <button
              onClick={onMessage}
              className="flex-1 btn-secondary text-sm py-2 px-3"
            >
              Message
            </button>
          )}
        </div>
      )}
    </div>
  );
}
