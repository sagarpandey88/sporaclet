'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HeadToHeadSectionProps {
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
  };
  headToHead?: {
    totalMatches: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    lastFiveResults: Array<{
      date: string;
      homeScore: number;
      awayScore: number;
      winner: 'home' | 'away' | 'draw';
    }>;
  };
}

export function HeadToHeadSection({
  homeTeam,
  awayTeam,
  headToHead,
}: HeadToHeadSectionProps) {
  if (!headToHead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Head-to-Head
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No historical data available for these teams.
          </p>
        </CardContent>
      </Card>
    );
  }

  const homeWinPercentage = (headToHead.homeWins / headToHead.totalMatches) * 100;
  const awayWinPercentage = (headToHead.awayWins / headToHead.totalMatches) * 100;
  const drawPercentage = (headToHead.draws / headToHead.totalMatches) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Head-to-Head
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {headToHead.homeWins}
            </div>
            <div className="text-sm text-muted-foreground">
              {homeTeam.shortName} Wins
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {headToHead.draws}
            </div>
            <div className="text-sm text-muted-foreground">Draws</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {headToHead.awayWins}
            </div>
            <div className="text-sm text-muted-foreground">
              {awayTeam.shortName} Wins
            </div>
          </div>
        </div>

        {/* Win Percentage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{homeTeam.shortName}</span>
            <span className="text-muted-foreground">
              {headToHead.totalMatches} matches
            </span>
            <span>{awayTeam.shortName}</span>
          </div>
          <div className="flex h-4 w-full overflow-hidden rounded-full">
            <div
              className="bg-blue-500"
              style={{ width: `${homeWinPercentage}%` }}
              title={`${homeWinPercentage.toFixed(1)}%`}
            />
            <div
              className="bg-gray-400"
              style={{ width: `${drawPercentage}%` }}
              title={`${drawPercentage.toFixed(1)}%`}
            />
            <div
              className="bg-red-500"
              style={{ width: `${awayWinPercentage}%` }}
              title={`${awayWinPercentage.toFixed(1)}%`}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{homeWinPercentage.toFixed(0)}%</span>
            <span>{drawPercentage.toFixed(0)}%</span>
            <span>{awayWinPercentage.toFixed(0)}%</span>
          </div>
        </div>

        {/* Last 5 Results */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Calendar className="h-4 w-4" />
            <span>Last 5 Meetings</span>
          </div>
          <div className="space-y-2">
            {headToHead.lastFiveResults.map((result, index) => {
              const isHomeWin = result.winner === 'home';
              const isAwayWin = result.winner === 'away';
              const isDraw = result.winner === 'draw';

              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {isHomeWin && <TrendingUp className="h-4 w-4 text-blue-600" />}
                    {isDraw && <Minus className="h-4 w-4 text-gray-600" />}
                    {isAwayWin && <TrendingDown className="h-4 w-4 text-red-600" />}
                    <span className="text-muted-foreground">
                      {new Date(result.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={isHomeWin ? 'font-bold text-blue-600' : ''}
                    >
                      {result.homeScore}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span
                      className={isAwayWin ? 'font-bold text-red-600' : ''}
                    >
                      {result.awayScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
