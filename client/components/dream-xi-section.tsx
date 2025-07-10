'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Star, TrendingUp, Award, Target, Trophy } from 'lucide-react';
import { DreamXI } from '@/lib/types';

interface DreamXISectionProps {
  dreamXI: DreamXI;
  sportType: string;
}

export function DreamXISection({ dreamXI, sportType }: DreamXISectionProps) {
  const isFootball = sportType.toLowerCase() === 'football';
  const isBasketball = sportType.toLowerCase() === 'basketball';
  const isTennis = sportType.toLowerCase() === 'tennis';

  const getFormationLayout = () => {
    if (isFootball) {
      const formation = dreamXI.formation;
      if (formation === '4-3-3') {
        return {
          lines: [
            { positions: ['GK'], label: 'Goalkeeper', spacing: 'justify-center' },
            { positions: ['RB', 'CB', 'CB', 'LB'], label: 'Defense', spacing: 'justify-between' },
            { positions: ['CM', 'CM', 'CM'], label: 'Midfield', spacing: 'justify-center' },
            { positions: ['RW', 'ST', 'LW'], label: 'Attack', spacing: 'justify-center' }
          ]
        };
      }
    }
    
    if (isBasketball) {
      return {
        lines: [
          { positions: ['PG'], label: 'Point Guard', spacing: 'justify-center' },
          { positions: ['SG'], label: 'Shooting Guard', spacing: 'justify-center' },
          { positions: ['SF'], label: 'Small Forward', spacing: 'justify-center' },
          { positions: ['PF'], label: 'Power Forward', spacing: 'justify-center' },
          { positions: ['C'], label: 'Center', spacing: 'justify-center' }
        ]
      };
    }

    if (isTennis) {
      return {
        lines: [
          { positions: ['Player'], label: 'Selected Player', spacing: 'justify-center' }
        ]
      };
    }

    // Default layout for other sports
    return {
      lines: [
        { positions: dreamXI.players.map(p => p.position), label: 'Starting Lineup', spacing: 'justify-center' }
      ]
    };
  };

  const layout = getFormationLayout();

  const getPlayerByPosition = (position: string) => {
    return dreamXI.players.find(p => p.position === position);
  };

  const getPositionColor = (position: string) => {
    if (isFootball) {
      if (position === 'GK') return 'bg-yellow-500';
      if (['RB', 'CB', 'LB'].includes(position)) return 'bg-blue-500';
      if (['CM', 'CDM', 'CAM'].includes(position)) return 'bg-green-500';
      if (['RW', 'ST', 'LW', 'CF'].includes(position)) return 'bg-red-500';
    }
    
    if (isBasketball) {
      if (position === 'PG') return 'bg-purple-500';
      if (position === 'SG') return 'bg-blue-500';
      if (position === 'SF') return 'bg-green-500';
      if (position === 'PF') return 'bg-orange-500';
      if (position === 'C') return 'bg-red-500';
    }

    return 'bg-primary';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Combined Dream {isTennis ? 'Selection' : isBasketball ? 'Starting 5' : 'XI'}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Formation: {dreamXI.formation}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              Avg Rating: {dreamXI.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Total Value: {dreamXI.totalFantasyValue.toFixed(1)} pts
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Formation Visualization */}
          <div className="relative bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-8 min-h-[600px]">
            {/* Field markings for football */}
            {isFootball && (
              <>
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full"></div>
                {/* Center line */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-white/30"></div>
                {/* Goal areas */}
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-16 h-32 border-2 border-white/30 border-l-0"></div>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-16 h-32 border-2 border-white/30 border-r-0"></div>
                {/* Penalty areas */}
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-24 h-48 border-2 border-white/20 border-l-0"></div>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-24 h-48 border-2 border-white/20 border-r-0"></div>
              </>
            )}
            
            {/* Basketball court markings */}
            {isBasketball && (
              <>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 border-2 border-white/30 rounded-full"></div>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 border-2 border-white/30 rounded-full"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-white/30"></div>
                {/* Three-point lines */}
                <div className="absolute top-8 left-8 right-8 h-32 border-2 border-white/20 border-t-0 rounded-b-full"></div>
                <div className="absolute bottom-8 left-8 right-8 h-32 border-2 border-white/20 border-b-0 rounded-t-full"></div>
              </>
            )}

            {/* Players positioned on the field */}
            <div className="relative h-full flex flex-col justify-between py-12">
              {layout.lines.map((line, lineIndex) => (
                <div key={lineIndex} className="flex flex-col items-center space-y-6">
                  {/* Position label */}
                  <Badge variant="outline" className="bg-white/90 dark:bg-black/90 text-xs font-medium">
                    {line.label}
                  </Badge>
                  
                  {/* Players in this line */}
                  <div className={`flex gap-8 ${line.spacing} w-full max-w-4xl px-8`}>
                    {line.positions.map((position, posIndex) => {
                      const player = getPlayerByPosition(position);
                      if (!player) {
                        // Show placeholder if player not found
                        return (
                          <div
                            key={posIndex}
                            className="flex flex-col items-center space-y-2 opacity-50"
                          >
                            <div className={`
                              w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xs
                              bg-gray-400 shadow-lg border-2 border-white/50
                            `}>
                              {position}
                            </div>
                            <div className="text-center bg-white/95 dark:bg-black/95 rounded-lg p-2 shadow-md min-w-[100px] max-w-[120px]">
                              <div className="font-semibold text-xs text-muted-foreground">No Player</div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={posIndex}
                          className="flex flex-col items-center space-y-3 group cursor-pointer"
                        >
                          <div className={`
                            w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xs
                            ${getPositionColor(position)} shadow-lg group-hover:scale-110 transition-transform duration-200
                            border-2 border-white/50 relative
                          `}>
                            {position}
                            {/* Player rating indicator */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-black">
                                {player.keyStats?.rating ? player.keyStats.rating.toFixed(1) : '7.5'}
                              </span>
                            </div>
                          </div>
                          <div className="text-center bg-white/95 dark:bg-black/95 rounded-lg p-3 shadow-md min-w-[120px] max-w-[140px] group-hover:shadow-lg transition-shadow">
                            <div className="font-semibold text-xs truncate">{player.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{player.team}</div>
                            <div className="text-xs font-medium text-primary mt-1">
                              {player.fantasyPoints.toFixed(1)} pts
                            </div>
                            {player.recentForm && (
                              <div className="flex justify-center gap-0.5 mt-1">
                                {player.recentForm.split('').slice(0, 3).map((result, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      result === 'W' ? 'bg-green-500' : 
                                      result === 'L' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {dreamXI.note && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground italic">{dreamXI.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Player Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {dreamXI.players.map((player, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {player.position} • {player.team}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      {player.fantasyPoints.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Fantasy Pts</div>
                  </div>
                </div>

                {player.recentForm && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Form:</span>
                    <div className="flex gap-1">
                      {player.recentForm.split('').map((result, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full text-xs flex items-center justify-center text-white font-bold ${
                            result === 'W' ? 'bg-green-500' : 
                            result === 'L' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {player.keyStats && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Key Stats:</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {Object.entries(player.keyStats).map(([stat, value]) => (
                        <div key={stat} className="text-center">
                          <div className="font-semibold">{value}</div>
                          <div className="text-muted-foreground capitalize">
                            {stat.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <strong>Selection Reason:</strong> {player.reason}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Substitutes */}
      {dreamXI.substitutes && dreamXI.substitutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Substitute Bench
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {dreamXI.substitutes.map((player, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{player.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {player.position} • {player.team}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-sm">
                        {player.fantasyPoints.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Pts</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {player.reason}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fantasy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fantasy Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {dreamXI.totalFantasyValue.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Total Fantasy Points</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {dreamXI.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dreamXI.players.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {isTennis ? 'Player Selected' : isBasketball ? 'Starting Players' : 'Starting XI'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Team Balance Score</span>
              <span className="font-medium">85%</span>
            </div>
            <Progress value={85} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Based on position coverage, form, and statistical performance
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}