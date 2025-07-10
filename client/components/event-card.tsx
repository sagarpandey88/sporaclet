'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  showPrediction?: boolean;
}

export function EventCard({ event, showPrediction = true }: EventCardProps) {
  const prediction = event.predictions?.[0];
  const isFootball = event.sportType.toLowerCase() === 'football';
  const isBasketball = event.sportType.toLowerCase() === 'basketball';
  const isTennis = event.sportType.toLowerCase() === 'tennis';

  const getTeamDisplay = () => {
    if (isTennis) {
      return (
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {event.teamsInvolved.player1.name}
          </div>
          <div className="text-xs text-muted-foreground">vs</div>
          <div className="text-sm font-medium">
            {event.teamsInvolved.player2.name}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {event.teamsInvolved.home?.name || event.teamsInvolved.team1?.name}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">vs</div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {event.teamsInvolved.away?.name || event.teamsInvolved.team2?.name}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {event.sportType}
            </Badge>
            {event.league && (
              <Badge variant="outline" className="text-xs">
                {event.league}
              </Badge>
            )}
          </div>
          {showPrediction && prediction && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {prediction.confidenceScore.toFixed(1)}%
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {getTeamDisplay()}
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(event.eventDate), 'MMM dd, HH:mm')}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.venue}
          </div>
        </div>

        {showPrediction && prediction && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Prediction:</span>
              <span className="font-medium">
                {isTennis 
                  ? prediction.predictionDetails.winner
                  : isBasketball 
                    ? prediction.predictionDetails.winner
                    : `${prediction.predictionDetails.winner} ${prediction.predictionDetails.score}`
                }
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/${event.id}`}>
              View Details
            </Link>
          </Button>
          
          {event.weatherConditions && (
            <div className="text-xs text-muted-foreground">
              {event.weatherConditions.temperature}°C, {event.weatherConditions.condition}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}