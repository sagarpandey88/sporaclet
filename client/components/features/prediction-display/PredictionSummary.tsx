import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PredictionSummaryProps {
  probabilities: {
    home?: number;
    away?: number;
    draw?: number;
  };
  predictedWinner: 'home' | 'away' | 'draw';
  confidence: 'low' | 'medium' | 'high';
  homeTeamName?: string;
  awayTeamName?: string;
  className?: string;
}

export function PredictionSummary({
  probabilities,
  predictedWinner,
  confidence,
  homeTeamName,
  awayTeamName,
  className = '',
}: PredictionSummaryProps) {
  const homeProb = (probabilities.home || 0) * 100;
  const awayProb = (probabilities.away || 0) * 100;
  const drawProb = (probabilities.draw || 0) * 100;

  const confidenceColors = {
    low: 'text-yellow-600 bg-yellow-50',
    medium: 'text-blue-600 bg-blue-50',
    high: 'text-green-600 bg-green-50',
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Confidence badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          AI Prediction
        </span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${confidenceColors[confidence]}`}
        >
          {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
        </span>
      </div>

      {/* Probability bars */}
      <div className="space-y-2">
        {/* Home team */}
        {homeProb > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[120px]">
                {homeTeamName || 'Home'}
              </span>
              <span className="font-semibold">{homeProb.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  predictedWinner === 'home' ? 'bg-green-500' : 'bg-blue-400'
                }`}
                style={{ width: `${homeProb}%` }}
              />
            </div>
          </div>
        )}

        {/* Away team */}
        {awayProb > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[120px]">
                {awayTeamName || 'Away'}
              </span>
              <span className="font-semibold">{awayProb.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  predictedWinner === 'away' ? 'bg-green-500' : 'bg-blue-400'
                }`}
                style={{ width: `${awayProb}%` }}
              />
            </div>
          </div>
        )}

        {/* Draw */}
        {drawProb > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Draw</span>
              <span className="font-semibold">{drawProb.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  predictedWinner === 'draw' ? 'bg-green-500' : 'bg-gray-400'
                }`}
                style={{ width: `${drawProb}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Winner indicator */}
      <div className="flex items-center gap-2 text-sm">
        {predictedWinner === 'home' || predictedWinner === 'away' ? (
          <>
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">
              {predictedWinner === 'home' ? homeTeamName || 'Home' : awayTeamName || 'Away'}{' '}
              favored to win
            </span>
          </>
        ) : (
          <>
            <TrendingDown className="h-4 w-4 text-gray-600" />
            <span className="text-muted-foreground">Draw predicted</span>
          </>
        )}
      </div>
    </div>
  );
}
