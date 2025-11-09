'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/features/header/Header';
import { SportFilter } from '@/components/features/event-filters/SportFilter';
import { SearchBox } from '@/components/features/event-filters/SearchBox';
import { EventCard } from '@/components/features/event-card/EventCard';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { eventsApi } from '@/services/events-api';
import { EventSummary, PaginatedResponse } from '@/types/events';

function UpcomingEventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters from URL
  const sport = searchParams.get('sport') || 'all';
  const search = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const result: PaginatedResponse<EventSummary> = await eventsApi.getUpcomingEvents({
          sport: sport === 'all' ? undefined : sport,
          page,
          perPage: 20,
        });

        setEvents(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [sport, search, page]);

  // Update URL with new filters
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    if (key !== 'page') {
      params.delete('page');
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl space-y-8">
          {/* Page header */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">Upcoming Events</h1>
            <p className="text-muted-foreground">
              Browse upcoming sports events with AI-powered predictions
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBox
              value={search}
              onChange={(value) => updateFilters('q', value)}
              className="flex-1"
            />
            <SportFilter
              value={sport}
              onChange={(value) => updateFilters('sport', value)}
            />
          </div>

          {/* Results count */}
          {!loading && !error && (
            <div className="text-sm text-muted-foreground">
              Showing {events.length} of {pagination.total} events
            </div>
          )}

          {/* Content */}
          {loading ? (
            <LoadingState count={6} />
          ) : error ? (
            <EmptyState
              title="Error loading events"
              description={error}
            />
          ) : events.length === 0 ? (
            <EmptyState
              title="No events found"
              description="Try adjusting your filters or check back later for new events"
            />
          ) : (
            <>
              {/* Event grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(newPage) => updateFilters('page', newPage.toString())}
                  className="mt-8"
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function UpcomingEventsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <UpcomingEventsContent />
    </Suspense>
  );
}
