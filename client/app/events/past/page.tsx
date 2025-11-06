"use client";

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/features/header/Header';
import { SportFilter } from '@/components/features/event-filters/SportFilter';
import { SearchBox } from '@/components/features/event-filters/SearchBox';
import { PastEventCard } from '@/components/features/event-card/PastEventCard';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventSummary } from '@/types/events';

/**
 * Past Events Page
 * 
 * Displays a list of completed/past sporting events with actual results
 * and prediction accuracy indicators. Users can filter by sport and search
 * by team name, similar to the upcoming events page.
 * 
 * Part of User Story 3 (P2) - Review Past Event Results
 */
export default function PastEventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const perPage = 20;

  // Fetch past events
  useEffect(() => {
    const fetchPastEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: perPage.toString(),
        });

        if (selectedSport) {
          params.append('sport', selectedSport);
        }

        if (searchQuery) {
          params.append('q', searchQuery);
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/events/past?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch past events: ${response.statusText}`);
        }

        const data = await response.json();
        setEvents(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching past events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, [currentPage, selectedSport, searchQuery]);

  // Handle sport filter change
  const handleSportChange = (sport: string) => {
    setSelectedSport(sport === 'all' ? '' : sport);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Past Events</h1>
          <p className="text-muted-foreground">
            Review completed events with actual results and AI prediction accuracy
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBox
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search past events by team name..."
            />
          </div>
          <div className="md:w-64">
            <SportFilter
              value={selectedSport || 'all'}
              onChange={handleSportChange}
            />
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <div className="mb-4 text-sm text-muted-foreground">
            {total === 0 ? (
              'No past events found'
            ) : (
              <>
                Showing {(currentPage - 1) * perPage + 1}-
                {Math.min(currentPage * perPage, total)} of {total} past events
              </>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && <LoadingState />}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <EmptyState
            title="No past events found"
            description={
              selectedSport || searchQuery
                ? 'Try adjusting your filters or search query'
                : 'Past events will appear here once they are completed'
            }
          />
        )}

        {/* Events grid */}
        {!loading && !error && events.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <PastEventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
