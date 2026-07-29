"use client";

import React, { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { MobileNavbar } from './MobileNavbar';

/**
 * Header component that renders either the desktop Navbar or the
 * MobileNavbar based on the current viewport width (md breakpoint).
 * This keeps a single source of truth for the header and avoids
 * having both navs mounted at the same time which caused visual
 * overlap and disappearing behavior when resizing.
 */
export default function Header() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    // Use matchMedia so we don't constantly read innerWidth on resize
    const mq = window.matchMedia('(min-width: 768px)');

    const update = (ev?: MediaQueryListEvent) => {
      setIsDesktop(ev ? ev.matches : mq.matches);
    };

    // Set initial value
    update();

    // Some browsers support addEventListener on MediaQueryList
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update as EventListener);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(update as any);
    }

    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', update as EventListener);
      } else if (typeof mq.removeListener === 'function') {
        mq.removeListener(update as any);
      }
    };
  }, []);

  // While we haven't determined the size on the client, render nothing
  // to avoid hydration mismatches; the nav will appear immediately after
  // hydration. This minimises flicker and prevents duplicate DOM nodes.
  if (isDesktop === null) return null;

  return isDesktop ? <Navbar /> : <MobileNavbar />;
}
