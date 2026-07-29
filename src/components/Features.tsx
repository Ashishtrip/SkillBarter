import { Search, User, MessageCircle, BarChart3, Shield, Heart } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find the perfect skill exchange partner with advanced filtering by category, level, and location.',
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      icon: User,
      title: 'Rich Profiles',
      description: 'LinkedIn-style profiles showcasing your skills, education, work experience, and certifications.',
      color: 'text-accent-500',
      bg: 'bg-accent-50',
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Connect and coordinate through built-in messaging with video call integration.',
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Dashboard insights to monitor your exchanges, learning streak, and skill growth.',
      color: 'text-warning-600',
      bg: 'bg-warning-50',
    },
    {
      icon: Shield,
      title: 'Safe & Verified',
      description: 'Identity verification, ratings, and reports keep the community trustworthy.',
      color: 'text-error-500',
      bg: 'bg-error-50',
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'Reddit-style groups, events, and discussions. Built for collaboration, not transactions.',
      color: 'text-pink-500',
      bg: 'bg-pink-50',
    },
  ];

  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-secondary-900 mb-3">
          Everything You Need to Exchange Skills
        </h2>
        <p className="text-secondary-500 max-w-lg mx-auto">
          Our platform is designed to make skill sharing simple, safe, and rewarding.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="card group">
              <div className={`w-11 h-11 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="text-base font-heading font-semibold text-secondary-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-secondary-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
