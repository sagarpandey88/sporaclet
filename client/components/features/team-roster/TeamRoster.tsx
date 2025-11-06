'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  position: string;
  jerseyNumber: string;
}

interface TeamRosterProps {
  team: {
    name: string;
    shortName: string;
  };
  players: Player[];
  isHome?: boolean;
}

// Position colors for visual distinction
const POSITION_COLORS: Record<string, string> = {
  Goalkeeper: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Defender: 'bg-blue-100 text-blue-800 border-blue-300',
  Midfielder: 'bg-green-100 text-green-800 border-green-300',
  Forward: 'bg-red-100 text-red-800 border-red-300',
  Guard: 'bg-purple-100 text-purple-800 border-purple-300',
  Center: 'bg-orange-100 text-orange-800 border-orange-300',
  // Tennis/Individual sports
  Singles: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  // Cricket
  Batsman: 'bg-teal-100 text-teal-800 border-teal-300',
  Bowler: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'All-rounder': 'bg-pink-100 text-pink-800 border-pink-300',
  'Wicket-keeper': 'bg-amber-100 text-amber-800 border-amber-300',
};

const getPositionColor = (position: string): string => {
  return POSITION_COLORS[position] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export function TeamRoster({ team, players, isHome = true }: TeamRosterProps) {
  // Group players by position
  const playersByPosition = players.reduce((acc, player) => {
    const position = player.position || 'Unknown';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  // Sort positions by typical football order
  const positionOrder = [
    'Goalkeeper',
    'Defender',
    'Midfielder',
    'Forward',
    'Guard',
    'Center',
    'Batsman',
    'Bowler',
    'All-rounder',
    'Wicket-keeper',
  ];

  const sortedPositions = Object.keys(playersByPosition).sort((a, b) => {
    const aIndex = positionOrder.indexOf(a);
    const bIndex = positionOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {team.name} Squad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No roster information available.
          </p>
        ) : (
          <div className="space-y-6">
            {sortedPositions.map((position) => (
              <div key={position}>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${getPositionColor(position)} text-xs`}
                  >
                    {position}
                  </Badge>
                  <span className="text-muted-foreground">
                    ({playersByPosition[position].length})
                  </span>
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {playersByPosition[position]
                    .sort((a, b) => {
                      const aNum = parseInt(a.jerseyNumber) || 999;
                      const bNum = parseInt(b.jerseyNumber) || 999;
                      return aNum - bNum;
                    })
                    .map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            isHome
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {player.jerseyNumber}
                        </div>
                        <span className="text-sm">{player.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
