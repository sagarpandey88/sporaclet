"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Sun, Moon } from 'lucide-react';
import { SearchAutocomplete } from '../search/SearchAutocomplete';

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sporaclet-theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = stored ? stored === 'dark' : prefersDark;
      setIsDark(initial);
      document.documentElement.setAttribute('data-theme', initial ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem('sporaclet-theme', next ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline">Sporaclet</span>
          </Link>

          {/* Search - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchAutocomplete placeholder="Quick search..." />
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            <Link
              href="/events/upcoming"
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px] flex items-center"
            >
              Upcoming Events
            </Link>
            <Link
              href="/events/past"
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px] flex items-center"
            >
              Past Events
            </Link>
            {/* Theme toggle (top-right) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={isDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md border p-2 hover:bg-accent/10 transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </nav>
        </div>

        {/* Mobile search - Below header on small screens */}
        <div className="md:hidden pb-3">
          <SearchAutocomplete placeholder="Search events..." />
        </div>
      </div>
    </header>
  );
}
