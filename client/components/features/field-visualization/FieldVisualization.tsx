'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Player {
  name: string;
  jerseyNumber: string;
  position: string;
}

interface FieldVisualizationProps {
  homeTeam: {
    name: string;
    shortName: string;
    players: Player[];
  };
  awayTeam: {
    name: string;
    shortName: string;
    players: Player[];
  };
  formation?: string;
}

export function FieldVisualization({
  homeTeam,
  awayTeam,
  formation = '4-4-2',
}: FieldVisualizationProps) {
  // Get starting 11 players by position for home team
  const getStartingLineup = (players: Player[]) => {
    const positionOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
    const lineup = {
      Goalkeeper: [] as Player[],
      Defender: [] as Player[],
      Midfielder: [] as Player[],
      Forward: [] as Player[],
    };

    players.forEach((player) => {
      if (lineup[player.position as keyof typeof lineup]) {
        lineup[player.position as keyof typeof lineup].push(player);
      }
    });

    return lineup;
  };

  const homeLineup = getStartingLineup(homeTeam.players.slice(0, 11));

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Field Formation</span>
          <Badge variant="outline">{formation}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-[2/3] bg-gradient-to-b from-green-600 to-green-700">
          {/* Field markings */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 150"
            preserveAspectRatio="none"
          >
            {/* Outer boundary */}
            <rect
              x="2"
              y="2"
              width="96"
              height="146"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />

            {/* Center line */}
            <line
              x1="2"
              y1="75"
              x2="98"
              y2="75"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />

            {/* Center circle */}
            <circle
              cx="50"
              cy="75"
              r="10"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <circle cx="50" cy="75" r="0.5" fill="white" opacity="0.8" />

            {/* Home penalty area (top) */}
            <rect
              x="20"
              y="2"
              width="60"
              height="16"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
            {/* Home 6-yard box */}
            <rect
              x="35"
              y="2"
              width="30"
              height="6"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
            {/* Home penalty spot */}
            <circle cx="50" cy="13" r="0.5" fill="white" opacity="0.8" />

            {/* Away penalty area (bottom) */}
            <rect
              x="20"
              y="132"
              width="60"
              height="16"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
            {/* Away 6-yard box */}
            <rect
              x="35"
              y="142"
              width="30"
              height="6"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
            {/* Away penalty spot */}
            <circle cx="50" cy="137" r="0.5" fill="white" opacity="0.8" />

            {/* Corner arcs */}
            <path
              d="M 2 2 Q 7 2 7 7"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <path
              d="M 98 2 Q 93 2 93 7"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <path
              d="M 2 148 Q 7 148 7 143"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <path
              d="M 98 148 Q 93 148 93 143"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.8"
            />
          </svg>

          {/* Player positions */}
          <div className="absolute inset-0 p-4">
            {/* Home Team (attacking downward) */}
            <div className="relative h-1/2 flex flex-col justify-between py-4">
              {/* Goalkeeper */}
              {homeLineup.Goalkeeper.slice(0, 1).map((player, idx) => (
                <div key={idx} className="flex justify-center">
                  <PlayerMarker
                    player={player}
                    isHome={true}
                    color="bg-blue-500"
                  />
                </div>
              ))}

              {/* Defenders */}
              <div className="flex justify-around px-4">
                {homeLineup.Defender.slice(0, 4).map((player, idx) => (
                  <PlayerMarker
                    key={idx}
                    player={player}
                    isHome={true}
                    color="bg-blue-500"
                  />
                ))}
              </div>

              {/* Midfielders */}
              <div className="flex justify-around px-8">
                {homeLineup.Midfielder.slice(0, 4).map((player, idx) => (
                  <PlayerMarker
                    key={idx}
                    player={player}
                    isHome={true}
                    color="bg-blue-500"
                  />
                ))}
              </div>

              {/* Forwards */}
              <div className="flex justify-around px-16">
                {homeLineup.Forward.slice(0, 2).map((player, idx) => (
                  <PlayerMarker
                    key={idx}
                    player={player}
                    isHome={true}
                    color="bg-blue-500"
                  />
                ))}
              </div>
            </div>

            {/* Away Team - Simplified (just show team name) */}
            <div className="relative h-1/2 flex items-center justify-center">
              <div className="text-white text-sm font-semibold bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                {awayTeam.shortName}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-around text-xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-blue-500 border-2 border-white" />
              <span>{homeTeam.shortName}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-red-500 border-2 border-white" />
              <span>{awayTeam.shortName}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PlayerMarkerProps {
  player: Player;
  isHome: boolean;
  color: string;
}

function PlayerMarker({ player, isHome, color }: PlayerMarkerProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold`}
      >
        {player.jerseyNumber}
      </div>
      <div className="text-white text-[10px] sm:text-xs font-medium bg-black/50 px-1 rounded whitespace-nowrap max-w-[60px] truncate">
        {player.name.split(' ').pop()}
      </div>
    </div>
  );
}
