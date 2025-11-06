import React from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { SearchAutocomplete } from '../search/SearchAutocomplete';

export function Header() {
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
