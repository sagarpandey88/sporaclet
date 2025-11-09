import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your filters or search query',
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {/* Icon */}
      <div className="mb-4 text-muted-foreground">
        {icon || <FileQuestion className="h-16 w-16" />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* Description */}
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

      {/* Optional action button */}
      {action && <div>{action}</div>}
    </div>
  );
}
