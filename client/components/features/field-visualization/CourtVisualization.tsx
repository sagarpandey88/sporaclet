'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CourtVisualizationProps {
  homeTeam: {
    name: string;
    shortName: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
  };
}

export function CourtVisualization({
  homeTeam,
  awayTeam,
}: CourtVisualizationProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Basketball Court</span>
          <Badge variant="outline">5 vs 5</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-[1/2] bg-gradient-to-b from-orange-900 to-orange-950">
          {/* Court markings */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 200"
            preserveAspectRatio="none"
          >
            {/* Outer boundary */}
            <rect
              x="5"
              y="5"
              width="90"
              height="190"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.9"
            />

            {/* Center line */}
            <line
              x1="5"
              y1="100"
              x2="95"
              y2="100"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.9"
            />

            {/* Center circle */}
            <circle
              cx="50"
              cy="100"
              r="8"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.9"
            />

            {/* Home key (top) */}
            <rect
              x="30"
              y="5"
              width="40"
              height="19"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.9"
            />
            {/* Home free throw circle */}
            <circle
              cx="50"
              cy="24"
              r="8"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.9"
            />
            {/* Home 3-point line */}
            <path
              d="M 10 5 Q 10 40 50 40 Q 90 40 90 5"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.9"
            />

            {/* Away key (bottom) */}
            <rect
              x="30"
              y="176"
              width="40"
              height="19"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.9"
            />
            {/* Away free throw circle */}
            <circle
              cx="50"
              cy="176"
              r="8"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.9"
            />
            {/* Away 3-point line */}
            <path
              d="M 10 195 Q 10 160 50 160 Q 90 160 90 195"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.9"
            />
          </svg>

          {/* Team labels */}
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="h-4 w-4 rounded-full bg-white" />
                <span className="font-semibold">{homeTeam.shortName}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="h-4 w-4 rounded-full bg-white" />
                <span className="font-semibold">{awayTeam.shortName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-around text-xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-blue-500 border-2 border-white" />
              <span>{homeTeam.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-red-500 border-2 border-white" />
              <span>{awayTeam.name}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
