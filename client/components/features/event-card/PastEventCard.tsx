import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { PredictionSummary } from '../prediction-display/PredictionSummary';
import { AccuracyBadge } from '../prediction-display/AccuracyBadge';
import { EventSummary } from '@/types/events';
import TeamAvatar from '@/components/ui/TeamAvatar';

interface PastEventCardProps {
  event: EventSummary;
  className?: string;
}

/**
 * PastEventCard Component
 * 
 * Displays a past/completed event card with actual results and prediction accuracy.
 * Extends EventCard with additional information about scores, winner, and accuracy.
 * Used on the past events listing page.
 * 
 * @param event - The past event data
 * @param className - Optional additional CSS classes
 */
export function PastEventCard({ event, className = '' }: PastEventCardProps) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Determine if home team won
  const homeTeamWon = event.winner === 'home';
  const awayTeamWon = event.winner === 'away';
  const isDraw = event.winner === 'draw';

  return (
    <Link href={`/events/${event.id}`}>
      <Card
        className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      >
        <CardHeader className="pb-3">
          {/* Sport badge and accuracy indicator */}
            <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{(event.sport || '').toString().charAt(0).toUpperCase() + (event.sport || '').toString().slice(1)}</Badge>
            <div className="flex items-center gap-2">
              {event.league && (
                <span className="text-xs text-muted-foreground">{event.league}</span>
              )}
              {event.prediction && (
                <AccuracyBadge isAccurate={event.prediction.isAccurate ?? null} />
              )}
            </div>
          </div>

          {/* Event name */}
          <h3 className="text-lg font-semibold line-clamp-2 min-h-[56px]">
            {event.eventName}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Teams or Participants with scores */}
          <div className="space-y-2">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <div className="font-medium">{event.eventName}</div>
              {isDraw && (
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Match ended in a draw
                </div>
              )}
            </div>
          </div>

          {/* Date and venue */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            )}
          </div>

          {/* Original Prediction summary */}
          {event.prediction && (
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-2">Original Prediction:</div>
              <PredictionSummary
                probabilities={event.prediction.probabilities}
                predictedWinner={event.prediction.predictedWinner}
                confidence={event.prediction.confidence}
                homeTeamName={event.homeTeam?.shortName}
                awayTeamName={event.awayTeam?.shortName}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
