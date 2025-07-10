'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Target, Award, Calendar, Filter, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Event, Prediction } from '@/lib/types';
import Link from 'next/link';
import { format } from 'date-fns';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getPredictions({ limit: 100 });
        
        if (response.success && response.data) {
          setPredictions(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch predictions');
        }
      } catch (err) {
        console.error('Error loading predictions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load predictions');
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, []);

  const highConfidencePredictions = predictions.filter(p => p.confidenceScore >= 75);
  const recentPredictions = predictions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const averageConfidence = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.confidenceScore, 0) / predictions.length 
    : 0;

  const PredictionCard = ({ prediction }: { prediction: any }) => {
    const event = prediction.event;
    const isTennis = event?.sportType?.toLowerCase() === 'tennis';
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {event?.sportType || 'Unknown'}
              </Badge>
              {event?.league && (
                <Badge variant="outline" className="text-xs">
                  {event.league}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium">
              <TrendingUp className="h-3 w-3" />
              {prediction.confidenceScore.toFixed(1)}%
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className={`text-sm font-medium ${isTennis ? 'text-center' : 'flex items-center justify-between'}`}>
            {event && isTennis ? (
              `${event.teamsInvolved?.player1?.name || 'Player 1'} vs ${event.teamsInvolved?.player2?.name || 'Player 2'}`
            ) : event ? (
              <>
                <span>{event.teamsInvolved?.home?.name || event.teamsInvolved?.team1?.name || 'Team 1'}</span>
                <span className="text-muted-foreground">vs</span>
                <span>{event.teamsInvolved?.away?.name || event.teamsInvolved?.team2?.name || 'Team 2'}</span>
              </>
            ) : (
              'Event details unavailable'
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Prediction:</span>
              <span className="font-medium">
                {prediction.predictionDetails?.winner || 'N/A'}
                {prediction.predictionDetails?.score && ` (${prediction.predictionDetails.score})`}
              </span>
            </div>
            
            {event?.eventDate && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Event Date:</span>
                <span>{format(new Date(event.eventDate), 'MMM dd, HH:mm')}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{prediction.confidenceScore.toFixed(1)}%</span>
            </div>
            <Progress value={prediction.confidenceScore} className="h-2" />
          </div>

          {event && (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={`/events/${prediction.eventId}`}>
                View Details
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sports Predictions</h1>
            <p className="text-muted-foreground">
              AI-powered predictions with detailed analysis and confidence scoring
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            {predictions.length} active predictions
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Error loading predictions</p>
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

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Predictions
                </p>
                <p className="text-2xl font-bold">{predictions.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Average Confidence
                </p>
                <p className="text-2xl font-bold">{averageConfidence.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  High Confidence
                </p>
                <p className="text-2xl font-bold">{highConfidencePredictions.length}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Predictions</TabsTrigger>
          <TabsTrigger value="high-confidence">High Confidence</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {predictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high-confidence" className="space-y-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Showing predictions with 75%+ confidence
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {highConfidencePredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Most recent predictions
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <Award className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Want More Detailed Analysis?</h2>
            <p className="text-muted-foreground">
              Get access to advanced analytics, real-time updates, and personalized predictions
              based on your favorite teams and sports.
            </p>
            <Button size="lg">
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}