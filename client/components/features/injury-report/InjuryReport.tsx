'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar } from 'lucide-react';

interface Injury {
  playerId: string;
  playerName: string;
  injuryType: string;
  severity: 'minor' | 'moderate' | 'major' | 'season_ending';
  expectedReturn?: string;
  status: 'active' | 'recovered' | 'day_to_day';
}

interface InjuryReportProps {
  team: {
    name: string;
    shortName: string;
  };
  injuries: Injury[];
}

const SEVERITY_CONFIG = {
  minor: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    label: 'Minor',
    icon: '🟡',
  },
  moderate: {
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    label: 'Moderate',
    icon: '🟠',
  },
  major: {
    color: 'bg-red-100 text-red-800 border-red-300',
    label: 'Major',
    icon: '🔴',
  },
  season_ending: {
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    label: 'Season Ending',
    icon: '🟣',
  },
};

const STATUS_CONFIG = {
  active: {
    color: 'bg-red-100 text-red-800 border-red-300',
    label: 'Out',
  },
  day_to_day: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    label: 'Day-to-Day',
  },
  recovered: {
    color: 'bg-green-100 text-green-800 border-green-300',
    label: 'Recovered',
  },
};

export function InjuryReport({ team, injuries }: InjuryReportProps) {
  const activeInjuries = injuries.filter((inj) => inj.status !== 'recovered');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Injury Report - {team.shortName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeInjuries.length === 0 ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800 font-medium">
              ✅ No active injuries reported
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeInjuries.map((injury) => {
              const severityConfig = SEVERITY_CONFIG[injury.severity];
              const statusConfig = STATUS_CONFIG[injury.status];

              return (
                <div
                  key={injury.playerId}
                  className="rounded-lg border p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  {/* Player Name and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {injury.playerName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {injury.injuryType}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${statusConfig.color} text-xs shrink-0`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Severity and Return Date */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Severity:</span>
                      <Badge
                        variant="outline"
                        className={`${severityConfig.color} text-xs`}
                      >
                        {severityConfig.icon} {severityConfig.label}
                      </Badge>
                    </div>
                    {injury.expectedReturn && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Expected:{' '}
                          {new Date(injury.expectedReturn).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {activeInjuries.length} player
              {activeInjuries.length !== 1 ? 's' : ''} currently unavailable
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
