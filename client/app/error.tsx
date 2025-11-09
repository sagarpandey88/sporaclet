'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

/**
 * Custom Error Page
 * 
 * Displays when an unhandled error occurs in the application.
 * Provides options to retry or navigate back to safety.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold">Something Went Wrong</h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error while processing your request.
            Don&apos;t worry, our team has been notified.
          </p>
        </div>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-muted rounded-lg text-left">
            <p className="text-xs font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            size="lg"
            onClick={reset}
            className="min-h-[48px] px-8"
          >
            <RefreshCcw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="min-h-[48px] px-8"
          >
            <Home className="mr-2 h-5 w-5" />
            Go Home
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            If the problem persists, please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
