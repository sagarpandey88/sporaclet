import React from 'react';
import { Card, CardContent } from './card';

interface LoadingStateProps {
  count?: number;
  className?: string;
}

export function LoadingState({ count = 6, className = '' }: LoadingStateProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            {/* Sport badge skeleton */}
            <div className="h-6 w-24 bg-gray-200 rounded mb-4" />

            {/* Event name skeleton */}
            <div className="h-6 w-full bg-gray-200 rounded mb-2" />

            {/* Teams skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-32 bg-gray-200 rounded" />
              <div className="h-6 w-12 bg-gray-200 rounded" />
              <div className="h-8 w-32 bg-gray-200 rounded" />
            </div>

            {/* Date and venue skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>

            {/* Prediction skeleton */}
            <div className="h-24 w-full bg-gray-200 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
