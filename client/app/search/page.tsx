"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/features/header/Header';
import { SearchResults } from '@/components/features/search/SearchResults';
import { SportFilter } from '@/components/features/event-filters/SportFilter';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { EventSummary } from '@/types/events';

/**
 * Search Results Page Content
 * Separated to use useSearchParams hook properly
 */
function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const sportParam = searchParams.get('sport') || 'all';
  const pageParam = searchParams.get('page') || '1';

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>(sportParam);
  const [currentPage, setCurrentPage] = useState(parseInt(pageParam));
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const perPage = 20;

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 3) {
        setLoading(false);
        setEvents([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          page: currentPage.toString(),
          per_page: perPage.toString(),
        });

        if (selectedSport && selectedSport !== 'all') {
          params.append('sport', selectedSport);
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/search?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to search events: ${response.statusText}`);
        }

        const data = await response.json();
        setEvents(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, currentPage, selectedSport]);

  // Handle sport filter change
  const handleSportChange = (sport: string) => {
    setSelectedSport(sport === 'all' ? '' : sport);
    setCurrentPage(1);
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Search Results</h1>
          {query && (
            <p className="text-muted-foreground">
              Results for: <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
            </p>
          )}
        </div>

        {/* Filters */}
        {query && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-64">
              <SportFilter
                value={selectedSport || 'all'}
                onChange={handleSportChange}
              />
            </div>
          </div>
        )}

        {/* No query message */}
        {!query && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Enter a search query to find events
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Search by team name, player name, or event name
            </p>
          </div>
        )}

        {/* Query too short message */}
        {query && query.length < 3 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Please enter at least 3 characters to search
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && query.length >= 3 && <LoadingState />}

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

        {/* Search results */}
        {!loading && !error && query.length >= 3 && (
          <>
            <SearchResults events={events} query={query} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/**
 * Search Results Page
 * 
 * Displays search results for events across all statuses (upcoming and past).
 * Users can filter by sport and paginate through results.
 * 
 * Part of User Story 4 (P3) - Quick Event Search
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchPageContent />
    </Suspense>
  );
}
