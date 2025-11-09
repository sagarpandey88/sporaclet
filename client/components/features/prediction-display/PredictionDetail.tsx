'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PredictionDetailProps {
  prediction: {
    probabilities: {
      home: number;
      away: number;
      draw?: number;
    };
    predictedWinner: 'home' | 'away' | 'draw';
    confidence: 'low' | 'medium' | 'high';
    keyFactors: string[];
    modelVersion?: string;
    generatedAt: string;
  };
  homeTeam: {
    name: string;
    shortName: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
  };
}

const COLORS = {
  home: '#3b82f6', // blue-500
  away: '#ef4444', // red-500
  draw: '#6b7280', // gray-500
};

const CONFIDENCE_COLORS = {
  low: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  medium: 'bg-blue-100 text-blue-800 border-blue-300',
  high: 'bg-green-100 text-green-800 border-green-300',
};

export function PredictionDetail({
  prediction,
  homeTeam,
  awayTeam,
}: PredictionDetailProps) {
  // Prepare data for chart
  const chartData = [
    {
      outcome: homeTeam.shortName,
      probability: prediction.probabilities.home,
      fill: COLORS.home,
    },
    {
      outcome: awayTeam.shortName,
      probability: prediction.probabilities.away,
      fill: COLORS.away,
    },
  ];

  if (prediction.probabilities.draw !== undefined) {
    chartData.push({
      outcome: 'Draw',
      probability: prediction.probabilities.draw,
      fill: COLORS.draw,
    });
  }

  // Get winner display
  const getWinnerDisplay = () => {
    switch (prediction.predictedWinner) {
      case 'home':
        return homeTeam.name;
      case 'away':
        return awayTeam.name;
      case 'draw':
        return 'Draw';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Prediction
            </CardTitle>
            <CardDescription>
              Generated on {new Date(prediction.generatedAt).toLocaleString()}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`${
              CONFIDENCE_COLORS[prediction.confidence]
            } font-semibold`}
          >
            {prediction.confidence.toUpperCase()} Confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Predicted Winner */}
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Trophy className="h-4 w-4" />
            <span>Predicted Winner</span>
          </div>
          <p className="text-2xl font-bold">{getWinnerDisplay()}</p>
        </div>

        {/* Probability Distribution Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="outcome" />
              <YAxis
                label={{
                  value: 'Probability (%)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="probability" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Factors */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <AlertCircle className="h-4 w-4" />
            <span>Key Factors</span>
          </div>
          <ul className="space-y-2">
            {prediction.keyFactors.map((factor, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Model Info */}
        {prediction.modelVersion && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Model Version: {prediction.modelVersion}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
