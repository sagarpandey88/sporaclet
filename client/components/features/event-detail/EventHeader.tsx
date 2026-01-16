import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TeamAvatar from '@/components/ui/TeamAvatar';

interface EventHeaderProps {
  eventName: string;
  sport: string;
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

  const sportDisplay = typeof sport === 'string' ? (sport.charAt(0).toUpperCase() + sport.slice(1)) : '';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sport and Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-sm">
          {sportDisplay}
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
        <div className="flex flex-col items-center md:flex-row md:justify-between gap-6">
          {/* Home team */}
          <div className="flex flex-col items-center gap-4 w-full md:flex-1 md:min-w-[200px]">
            <TeamAvatar
              logoUrl={homeTeam?.logoUrl}
              name={homeTeam?.name}
              shortName={homeTeam?.shortName}
              className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-md"
            />
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold">{homeTeam.shortName}</h2>
              <p className="text-sm text-muted-foreground">{homeTeam.name}</p>
            </div>
          </div>
          {/* VS */}
          <div className="text-2xl md:text-3xl font-bold text-muted-foreground my-2 md:my-0">VS</div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-4 w-full md:flex-1 md:min-w-[200px]">
            <TeamAvatar
              logoUrl={awayTeam?.logoUrl}
              name={awayTeam?.name}
              shortName={awayTeam?.shortName}
              className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-md"
            />
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold">{awayTeam.shortName}</h2>
              <p className="text-sm text-muted-foreground">{awayTeam.name}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold">{eventName}</div>
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

       
      </div>
    </div>
  );
}
