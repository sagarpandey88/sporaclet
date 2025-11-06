import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventHeaderProps {
  eventName: string;
  sport: {
    name: string;
    displayName: string;
  };
  homeTeam?: {
    name: string;
    shortName: string;
    logoUrl?: string | null;
  };
  awayTeam?: {
    name: string;
    shortName: string;
    logoUrl?: string | null;
  };
  participant1Name?: string;
  participant2Name?: string;
  date: string;
  venue?: string | null;
  league?: string | null;
  status: string;
  attendance?: number | null;
  className?: string;
}

export function EventHeader({
  eventName,
  sport,
  homeTeam,
  awayTeam,
  participant1Name,
  participant2Name,
  date,
  venue,
  league,
  status,
  attendance,
  className = '',
}: EventHeaderProps) {
  const eventDate = new Date(date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    live: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    postponed: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sport and Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-sm">
          {sport.displayName}
        </Badge>
        {league && (
          <Badge variant="outline" className="text-sm">
            {league}
          </Badge>
        )}
        <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Event title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
        {eventName}
      </h1>

      {/* Teams or Participants */}
      {homeTeam && awayTeam ? (
        <div className="flex items-center justify-center sm:justify-between gap-8 flex-wrap">
          {/* Home team */}
          <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]">
            {homeTeam.logoUrl && (
              <img
                src={homeTeam.logoUrl}
                alt={homeTeam.name}
                className="h-24 w-24 sm:h-32 sm:w-32 object-contain"
              />
            )}
            <div className="text-center">
              <h2 className="text-2xl font-bold">{homeTeam.shortName}</h2>
              <p className="text-sm text-muted-foreground">{homeTeam.name}</p>
            </div>
          </div>

          {/* VS */}
          <div className="text-3xl font-bold text-muted-foreground">VS</div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]">
            {awayTeam.logoUrl && (
              <img
                src={awayTeam.logoUrl}
                alt={awayTeam.name}
                className="h-24 w-24 sm:h-32 sm:w-32 object-contain"
              />
            )}
            <div className="text-center">
              <h2 className="text-2xl font-bold">{awayTeam.shortName}</h2>
              <p className="text-sm text-muted-foreground">{awayTeam.name}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold">{participant1Name}</div>
          <div className="text-3xl font-bold text-muted-foreground">VS</div>
          <div className="text-2xl font-bold">{participant2Name}</div>
        </div>
      )}

      {/* Event details */}
      <div className="flex flex-wrap gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 flex-shrink-0" />
          <span>
            {formattedDate} at {formattedTime}
          </span>
        </div>

        {venue && (
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 flex-shrink-0" />
            <span>{venue}</span>
          </div>
        )}

        {attendance && (
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 flex-shrink-0" />
            <span>{attendance.toLocaleString()} attendees</span>
          </div>
        )}
      </div>
    </div>
  );
}
