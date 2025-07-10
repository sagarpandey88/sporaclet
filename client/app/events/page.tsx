'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventCard } from '@/components/event-card';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Search, Filter, Calendar, MapPin, Trophy, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Event } from '@/lib/types';

const sportTypes = [
  { value: 'all', label: 'All Sports', icon: '🏆' },
  { value: 'football', label: 'Football', icon: '⚽' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
  { value: 'baseball', label: 'Baseball', icon: '⚾' },
  { value: 'american-football', label: 'American Football', icon: '🏈' },
  { value: 'hockey', label: 'Hockey', icon: '🏒' }
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (searchTerm.trim()) {
          // Use search API
          const response = await apiClient.searchEvents(searchTerm, {
            limit: 100 // Get more results for client-side filtering
          });
          
          if (response.success && response.data) {
            setEvents(response.data);
          } else {
            throw new Error(response.error || 'Failed to search events');
          }
        } else {
          // Use regular events API with filters
          const filters: any = { limit: 100 };
          if (selectedSport !== 'all') filters.sport_type = selectedSport;
          if (selectedLeague !== 'all') filters.league = selectedLeague;
          
          const response = await apiClient.getEvents(filters);
          
          if (response.success && response.data) {
            setEvents(response.data);
          } else {
            throw new Error(response.error || 'Failed to fetch events');
          }
        }
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [searchTerm, selectedSport, selectedLeague]);

  // Client-side filtering and sorting
  const filteredEvents = events
    .filter(event => {
      if (selectedSport !== 'all' && event.sportType.toLowerCase() !== selectedSport) {
        return false;
      }
      if (selectedLeague !== 'all' && event.league !== selectedLeague) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        case 'confidence':
          const aConfidence = a.predictions?.[0]?.confidenceScore || 0;
          const bConfidence = b.predictions?.[0]?.confidenceScore || 0;
          return bConfidence - aConfidence;
        case 'sport':
          return a.sportType.localeCompare(b.sportType);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);

  // Get unique leagues
  const leagues = Array.from(new Set(events.map(e => e.league).filter(Boolean)));

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSport('all');
    setSelectedLeague('all');
    setSortBy('date');
    setCurrentPage(1);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sports Events</h1>
            <p className="text-muted-foreground">
              Discover upcoming events with detailed predictions and analytics
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {filteredEvents.length} events found
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams, venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sport</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sportTypes.map((sport) => (
                    <SelectItem key={sport.value} value={sport.value}>
                      <span className="flex items-center gap-2">
                        {sport.icon} {sport.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">League</label>
              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger>
                  <SelectValue placeholder="Select league" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  {leagues.map((league) => (
                    <SelectItem key={league} value={league!}>
                      <span className="flex items-center gap-2">
                        <Trophy className="h-3 w-3" />
                        {league}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                  <SelectItem value="sport">Sport</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
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

      {/* Events Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {paginatedEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">No events found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to find more events.
                  </p>
                </div>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}