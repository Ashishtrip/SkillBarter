import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { Stats } from '@/components/Stats';

export default function Home() {
  return (
    <div className="space-y-16">
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
    </div>
  );
}
