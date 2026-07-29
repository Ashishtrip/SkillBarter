import { UserPlus, Search, ArrowRightLeft } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Sign up and tell us about the skills you can teach and what you want to learn.',
    },
    {
      number: '02',
      icon: Search,
      title: 'Find & Connect',
      description: 'Search for people with complementary skills and start a conversation.',
    },
    {
      number: '03',
      icon: ArrowRightLeft,
      title: 'Exchange Skills',
      description: 'Arrange skill swaps, track your progress, and build lasting connections.',
    },
  ];

  return (
    <section className="section-card">
      <div className="px-6 sm:px-10 py-10 sm:py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-secondary-900 mb-3">
            How It Works
          </h2>
          <p className="text-secondary-500 max-w-lg mx-auto">
            Getting started is simple. Follow these three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px] bg-secondary-200" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center relative">
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg relative z-10 rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-accent-500 rounded-full flex items-center justify-center z-20 shadow-sm">
                    <span className="text-[11px] font-heading font-bold text-white">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-base font-heading font-semibold text-secondary-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-secondary-500 leading-relaxed max-w-[260px] mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
