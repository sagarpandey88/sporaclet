import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { PredictionSummary } from '../prediction-display/PredictionSummary';
import TeamAvatar from '@/components/ui/TeamAvatar';
import { EventSummary } from '@/types/events';

interface EventCardProps {
  event: EventSummary;
  className?: string;
}

export function EventCard({ event, className = '' }: EventCardProps) {
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

  return (
    <Link href={`/events/${event.id}`}>
      <Card
        className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      >
        <CardHeader className="pb-3">
          {/* Sport badge */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{(event.sport || '').toString().charAt(0).toUpperCase() + (event.sport || '').toString().slice(1)}</Badge>
            {event.league && (
              <span className="text-xs text-muted-foreground">{event.league}</span>
            )}
          </div>

          {/* Event name */}
          <h3 className="text-lg font-semibold line-clamp-2 min-h-[56px]">
            {event.eventName}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Teams or Participants */}
          {event.homeTeam && event.awayTeam ? (
            <div className="flex items-center justify-between gap-4">
              {/* Home team */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <TeamAvatar
                  logoUrl={event.homeTeam?.logoUrl}
                  name={event.homeTeam?.name}
                  shortName={event.homeTeam?.shortName}
                  className="h-8 w-8 rounded-full"
                />
                <span className="font-medium truncate">
                  {event.homeTeam.shortName}
                </span>
              </div>

              {/* VS */}
              <span className="text-muted-foreground font-semibold flex-shrink-0">
                VS
              </span>

              {/* Away team */}
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <span className="font-medium truncate">
                  {event.awayTeam.shortName}
                </span>
                <TeamAvatar
                  logoUrl={event.awayTeam?.logoUrl}
                  name={event.awayTeam?.name}
                  shortName={event.awayTeam?.shortName}
                  className="h-8 w-8 rounded-full"
                />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="font-medium">{event.eventName}</div>
            </div>
          )}

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

          {/* Prediction summary */}
          {event.prediction && (
            <PredictionSummary
              probabilities={event.prediction.probabilities}
              predictedWinner={event.prediction.predictedWinner}
              confidence={event.prediction.confidence}
              homeTeamName={event.homeTeam?.shortName}
              awayTeamName={event.awayTeam?.shortName}
            />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
