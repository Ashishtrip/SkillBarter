import React from 'react';
import SkillsBrowser from '@/components/SkillsBrowser';

export const metadata = {
  title: 'Skills',
  description: 'Browse and add skills',
};

export default function Page() {
  return (
    <main className="min-h-screen p-6">
      <SkillsBrowser />
    </main>
  );
}
