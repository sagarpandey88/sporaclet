'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DreamXISection } from '@/components/dream-xi-section';
import { ArrowLeft, Calendar, MapPin, TrendingUp, Users, Cloud, History, Target, Trophy, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api';
import { Event } from '@/lib/types';

interface EventDetailContentProps {
  params: { id: string };
}

export default function EventDetailContent({ params }: EventDetailContentProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getEventById(params.id);
        
        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          throw new Error(response.error || 'Event not found');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-96 bg-muted rounded animate-pulse" />
            <div className="h-96 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center border-destructive/50 bg-destructive/5">
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-destructive">Error Loading Event</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button asChild>
                <Link href="/events">
                  Back to Events
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Target className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-2xl font-bold">Event Not Found</h2>
              <p className="text-muted-foreground">
                The event you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Button asChild>
              <Link href="/events">
                Back to Events
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const prediction = event.predictions?.[0];
  const isTennis = event.sportType.toLowerCase() === 'tennis';

  const getTeamDisplay = () => {
    if (isTennis) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-lg font-semibold">{event.teamsInvolved.player1.name}</div>
            <div className="text-sm text-muted-foreground">#{event.teamsInvolved.player1.ranking}</div>
            <div className="text-xs text-muted-foreground">{event.teamsInvolved.player1.country}</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-lg font-semibold">{event.teamsInvolved.player2.name}</div>
            <div className="text-sm text-muted-foreground">#{event.teamsInvolved.player2.ranking}</div>
            <div className="text-xs text-muted-foreground">{event.teamsInvolved.player2.country}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-lg font-semibold">
            {event.teamsInvolved.home?.name || event.teamsInvolved.team1?.name}
          </div>
          <div className="text-sm text-muted-foreground">Home</div>
          {event.teamsInvolved.home?.form && (
            <div className="text-xs text-muted-foreground mt-1">
              Form: {event.teamsInvolved.home.form}
            </div>
          )}
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-lg font-semibold">
            {event.teamsInvolved.away?.name || event.teamsInvolved.team2?.name}
          </div>
          <div className="text-sm text-muted-foreground">Away</div>
          {event.teamsInvolved.away?.form && (
            <div className="text-xs text-muted-foreground mt-1">
              Form: {event.teamsInvolved.away.form}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/events" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
      </Button>

      {/* Event Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-sm">
                  {event.sportType}
                </Badge>
                {event.league && (
                  <Badge variant="outline" className="text-sm">
                    {event.league}
                  </Badge>
                )}
                {event.tournament && (
                  <Badge variant="outline" className="text-sm">
                    {event.tournament}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">
                {isTennis 
                  ? `${event.teamsInvolved.player1.name} vs ${event.teamsInvolved.player2.name}`
                  : `${event.teamsInvolved.home?.name || event.teamsInvolved.team1?.name} vs ${event.teamsInvolved.away?.name || event.teamsInvolved.team2?.name}`
                }
              </h1>
            </div>
            {prediction && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {prediction.confidenceScore.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {getTeamDisplay()}
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.eventDate), 'EEEE, MMMM dd, yyyy at HH:mm')}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </div>
            {event.weatherConditions && (
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                {event.weatherConditions.temperature}°C, {event.weatherConditions.condition}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Prediction Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="prediction" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="prediction">Prediction</TabsTrigger>
              <TabsTrigger value="dream-xi">Dream {isTennis ? 'Pick' : event.sportType.toLowerCase() === 'basketball' ? '5' : 'XI'}</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="prediction" className="space-y-6">
              {prediction && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Our Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Predicted Winner</label>
                        <div className="text-lg font-semibold">
                          {prediction.predictionDetails.winner}
                        </div>
                      </div>
                      {prediction.predictionDetails.score && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Predicted Score</label>
                          <div className="text-lg font-semibold">
                            {prediction.predictionDetails.score}
                          </div>
                        </div>
                      )}
                      {prediction.predictionDetails.sets && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Predicted Sets</label>
                          <div className="text-lg font-semibold">
                            {prediction.predictionDetails.sets}
                          </div>
                        </div>
                      )}
                      {prediction.predictionDetails.totalPoints && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Total Points</label>
                          <div className="text-lg font-semibold">
                            {prediction.predictionDetails.totalPoints}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Factors Considered</h4>
                      <div className="space-y-3">
                        {Object.entries(prediction.factorsConsidered).map(([factor, weight]) => (
                          <div key={factor} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                              <span className={`font-medium ${(weight as number) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(weight as number) > 0 ? '+' : ''}{weight}%
                              </span>
                            </div>
                            <Progress 
                              value={Math.abs(weight as number)} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="dream-xi" className="space-y-6">
              {event.dreamXI && (
                <DreamXISection dreamXI={event.dreamXI} sportType={event.sportType} />
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              {event.weatherConditions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="h-5 w-5" />
                      Weather Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{event.weatherConditions.temperature}°C</div>
                        <div className="text-sm text-muted-foreground">Temperature</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{event.weatherConditions.humidity}%</div>
                        <div className="text-sm text-muted-foreground">Humidity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{event.weatherConditions.windSpeed} km/h</div>
                        <div className="text-sm text-muted-foreground">Wind Speed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{event.weatherConditions.condition}</div>
                        <div className="text-sm text-muted-foreground">Condition</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {event.historicalData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Head-to-Head Record
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3 text-center">
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {isTennis ? event.historicalData.headToHead.player1 : event.historicalData.headToHead.home}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isTennis ? 'Player 1 Wins' : 'Home Wins'}
                        </div>
                      </div>
                      {!isTennis && (
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">
                            {event.historicalData.headToHead.draws}
                          </div>
                          <div className="text-sm text-muted-foreground">Draws</div>
                        </div>
                      )}
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {isTennis ? event.historicalData.headToHead.player2 : event.historicalData.headToHead.away}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isTennis ? 'Player 2 Wins' : 'Away Wins'}
                        </div>
                      </div>
                    </div>

                    {event.historicalData.lastMeeting && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Last Meeting</h4>
                        <div className="text-sm text-muted-foreground mb-1">
                          {format(new Date(event.historicalData.lastMeeting.date), 'MMMM dd, yyyy')}
                        </div>
                        <div className="font-medium">
                          {event.historicalData.lastMeeting.result}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Event Date</span>
                <span className="text-sm font-medium">
                  {format(new Date(event.eventDate), 'MMM dd')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Venue</span>
                <span className="text-sm font-medium">{event.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sport</span>
                <span className="text-sm font-medium">{event.sportType}</span>
              </div>
              {event.league && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">League</span>
                  <span className="text-sm font-medium">{event.league}</span>
                </div>
              )}
              {prediction && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className="text-sm font-medium text-primary">
                    {prediction.confidenceScore.toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Want More Insights?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get detailed analytics and live updates for this event.
              </p>
              <Button className="w-full">
                Follow Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}