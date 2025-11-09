import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AccuracyBadgeProps {
  isAccurate: boolean | null;
  className?: string;
}

/**
 * AccuracyBadge Component
 * 
 * Displays a visual indicator showing whether an AI prediction was accurate or not.
 * Used on past event cards and detail pages to build trust through transparency.
 * 
 * @param isAccurate - True if prediction was correct, false if incorrect, null if not yet determined
 * @param className - Optional additional CSS classes
 */
export function AccuracyBadge({ isAccurate, className = '' }: AccuracyBadgeProps) {
  if (isAccurate === null || isAccurate === undefined) {
    return (
      <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs">Pending</span>
      </Badge>
    );
  }

  if (isAccurate) {
    return (
      <Badge variant="default" className={`flex items-center gap-1 bg-green-600 hover:bg-green-700 ${className}`}>
        <CheckCircle2 className="h-3 w-3" />
        <span className="text-xs font-medium">Accurate</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className={`flex items-center gap-1 ${className}`}>
      <XCircle className="h-3 w-3" />
      <span className="text-xs font-medium">Inaccurate</span>
    </Badge>
  );
}
