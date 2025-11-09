import React from 'react';
import { EventCard } from '../event-card/EventCard';
import { PastEventCard } from '../event-card/PastEventCard';
import { EventSummary, EventStatus } from '@/types/events';

interface SearchResultsProps {
  events: EventSummary[];
  query: string;
  className?: string;
}

/**
 * SearchResults Component
 * 
 * Displays search results showing both upcoming and past events.
 * Uses EventCard for upcoming events and PastEventCard for completed events.
 * 
 * Part of User Story 4 (P3) - Quick Event Search
 */
export function SearchResults({ events, query, className = '' }: SearchResultsProps) {
  // Group events by status
  const upcomingEvents = events.filter((e) => e.status === EventStatus.upcoming);
  const pastEvents = events.filter((e) => e.status === EventStatus.completed);
  const liveEvents = events.filter((e) => e.status === EventStatus.live);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Search summary */}
      <div className="text-sm text-muted-foreground">
        Found <span className="font-semibold text-foreground">{events.length}</span> result
        {events.length !== 1 ? 's' : ''} for &quot;<span className="font-semibold text-foreground">{query}</span>&quot;
      </div>

      {/* Live events (if any) */}
      {liveEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Now ({liveEvents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            Upcoming Events ({upcomingEvents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Past events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            Past Events ({pastEvents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <PastEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No events found matching your search
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try different keywords or check your spelling
          </p>
        </div>
      )}
    </div>
  );
}
