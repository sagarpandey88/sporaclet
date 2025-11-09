'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/features/header/Header';
import { SportFilter } from '@/components/features/event-filters/SportFilter';
import { SearchBox } from '@/components/features/event-filters/SearchBox';
import { EventCard } from '@/components/features/event-card/EventCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { eventsApi } from '@/services/events-api';
import { EventSummary, PaginatedResponse } from '@/types/events';
import { Calendar, BarChart3, TrendingUp } from 'lucide-react';

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch upcoming events (first page, limited)
        const upcomingResult: PaginatedResponse<EventSummary> = await eventsApi.getUpcomingEvents({
          page: 1,
          perPage: 9, // Show more events on main page
        });

        setUpcomingEvents(upcomingResult.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <LoadingState />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <EmptyState
            title="Error Loading Events"
            description={error}
            action={
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            }
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Sports Events
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover upcoming events with AI-powered predictions and review past results
              </p>
            </div>

            {/* Quick navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/events/upcoming">
                <Button size="lg" className="min-h-[48px] px-6">
                  <Calendar className="mr-2 h-5 w-5" />
                  View All Upcoming Events
                </Button>
              </Link>
              <Link href="/events/past">
                <Button size="lg" variant="outline" className="min-h-[48px] px-6">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View All Past Events
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Upcoming Events
                </h2>
                <p className="text-muted-foreground mt-1">
                  Events with AI predictions and insights
                </p>
              </div>
              <Link href="/events/upcoming">
                <Button variant="outline">View All</Button>
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Upcoming Events"
                description="There are no upcoming events at the moment. Check back later!"
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}