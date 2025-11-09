import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { WinnerType } from '@/types/events';
import { AccuracyBadge } from './AccuracyBadge';

interface AccuracyAnalysisProps {
  prediction: {
    predictedWinner: WinnerType;
    confidence: string;
    probabilities: {
      home?: number;
      away?: number;
      draw?: number;
    };
    isAccurate?: boolean;
    accuracyNote?: string;
  };
  actualWinner: WinnerType;
  homeTeamName?: string;
  awayTeamName?: string;
  className?: string;
}

/**
 * AccuracyAnalysis Component
 * 
 * Displays a detailed comparison between the AI prediction and actual result
 * for completed events. Shows accuracy badge, predicted vs actual outcome,
 * and probabilities to build trust through transparency.
 * 
 * Used on event detail pages for past events (User Story 3).
 * 
 * @param prediction - The original prediction data
 * @param actualWinner - The actual winner of the event
 * @param homeTeamName - Name of home team (for display)
 * @param awayTeamName - Name of away team (for display)
 * @param className - Optional additional CSS classes
 */
export function AccuracyAnalysis({
  prediction,
  actualWinner,
  homeTeamName,
  awayTeamName,
  className = '',
}: AccuracyAnalysisProps) {
  const isAccurate = prediction.isAccurate ?? false;

  // Get winner names for display
  const getWinnerName = (winner: WinnerType): string => {
    if (winner === WinnerType.home) return homeTeamName || 'Home';
    if (winner === WinnerType.away) return awayTeamName || 'Away';
    return 'Draw';
  };

  const predictedWinnerName = getWinnerName(prediction.predictedWinner);
  const actualWinnerName = getWinnerName(actualWinner);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Prediction Accuracy
          </span>
          <AccuracyBadge isAccurate={isAccurate} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prediction vs Actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Predicted Winner */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground font-medium">
              AI Predicted Winner
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{predictedWinnerName}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Confidence: <span className="font-medium uppercase">{prediction.confidence}</span>
            </div>
          </div>

          {/* Actual Winner */}
          <div className={`space-y-2 p-4 rounded-lg ${
            isAccurate ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
          }`}>
            <div className="text-sm font-medium flex items-center gap-2">
              {isAccurate ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">Actual Winner</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-700">Actual Winner</span>
                </>
              )}
            </div>
            <div className="text-2xl font-bold">{actualWinnerName}</div>
            {prediction.accuracyNote && (
              <div className="text-xs text-muted-foreground">
                {prediction.accuracyNote}
              </div>
            )}
          </div>
        </div>

        {/* Probability Breakdown */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Original Probabilities
          </div>
          
          <div className="space-y-2">
            {/* Home probability */}
            {prediction.probabilities.home !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{homeTeamName || 'Home'}</span>
                  <span className="font-medium">
                    {(prediction.probabilities.home * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      actualWinner === WinnerType.home ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${prediction.probabilities.home * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Draw probability */}
            {prediction.probabilities.draw !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Draw</span>
                  <span className="font-medium">
                    {(prediction.probabilities.draw * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      actualWinner === WinnerType.draw ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${prediction.probabilities.draw * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Away probability */}
            {prediction.probabilities.away !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{awayTeamName || 'Away'}</span>
                  <span className="font-medium">
                    {(prediction.probabilities.away * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      actualWinner === WinnerType.away ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${prediction.probabilities.away * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="pt-3 border-t text-sm text-muted-foreground">
          {isAccurate ? (
            <p>
              ✓ The AI successfully predicted the outcome of this event. The highest probability
              was assigned to the actual winner, demonstrating the model&apos;s accuracy.
            </p>
          ) : (
            <p>
              ✗ The AI&apos;s prediction did not match the actual outcome. This helps us improve
              the model and provides transparency about prediction accuracy.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
