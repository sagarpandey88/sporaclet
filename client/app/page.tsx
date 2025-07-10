'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventCard } from '@/components/event-card';
import { SportFilter } from '@/components/sport-filter';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { TrendingUp, Users, Target, Award, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Event } from '@/lib/types';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedSport, setSelectedSport] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = selectedSport !== 'all' ? { sport_type: selectedSport, limit: 6 } : { limit: 6 };
        const response = await apiClient.getEvents(filters);
        
        if (response.success && response.data) {
          setEvents(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch events');
        }
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [selectedSport]);

  const featuredEvents = events.slice(0, 6);

  const stats = [
    {
      title: 'Active Predictions',
      value: '1,234',
      icon: Target,
      description: 'Live predictions across all sports',
      trend: '+12%'
    },
    {
      title: 'Success Rate',
      value: '78.5%',
      icon: TrendingUp,
      description: 'Average prediction accuracy',
      trend: '+5.2%'
    },
    {
      title: 'Sports Covered',
      value: '12',
      icon: Award,
      description: 'Different sports categories',
      trend: '+2'
    },
    {
      title: 'Daily Users',
      value: '45.2K',
      icon: Users,
      description: 'Active prediction users',
      trend: '+18%'
    }
  ];

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Advanced Sports
            <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
              {' '}Predictions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get accurate predictions powered by advanced analytics, weather data, 
            historical statistics, and machine learning algorithms.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/events">
              Explore Predictions
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/predictions">
              View All Sports
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Icon className="h-8 w-8 text-primary" />
                    <span className="text-xs font-medium text-green-600">
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Sport Filters */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Events</h2>
            <p className="text-muted-foreground">
              Upcoming matches with our highest confidence predictions
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/events">
              View All Events
            </Link>
          </Button>
        </div>

        <SportFilter 
          selectedSport={selectedSport} 
          onSportChange={setSelectedSport} 
        />
      </section>

      {/* Featured Events */}
      <section className="space-y-6">
        {error && (
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error loading events</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Card>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && !error && featuredEvents.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">No events found</h3>
                <p className="text-muted-foreground">
                  Try selecting a different sport or check back later for new predictions.
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedSport('all')}>
                Show All Sports
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-muted/50 rounded-lg p-8 md:p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold">Ready to Start Predicting?</h2>
          <p className="text-muted-foreground">
            Join thousands of users who trust our advanced analytics for their sports predictions.
            Get detailed insights, weather analysis, and historical data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/events">
                Browse All Events
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}