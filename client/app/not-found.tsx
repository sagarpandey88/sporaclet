import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

/**
 * Custom 404 Not Found Page
 * 
 * Displays when a user navigates to a non-existent route.
 * Provides helpful navigation options to get back to the main site.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 Title */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold">Page Not Found</h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
          The page may have been moved, deleted, or doesn&apos;t exist.
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/">
            <Button size="lg" className="min-h-[48px] px-8">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Link href="/events/upcoming">
            <Button size="lg" variant="outline" className="min-h-[48px] px-8">
              <Search className="mr-2 h-5 w-5" />
              Browse Events
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-3">Popular pages:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/events/upcoming" className="text-sm text-primary hover:underline">
              Upcoming Events
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/events/past" className="text-sm text-primary hover:underline">
              Past Events
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/search" className="text-sm text-primary hover:underline">
              Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metadata
export const metadata = {
  title: '404 - Page Not Found | Sporaclet',
  description: 'The page you are looking for could not be found.',
};
