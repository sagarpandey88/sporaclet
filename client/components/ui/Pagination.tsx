import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  const pages: (number | string)[] = [];

  // Always show first page
  pages.push(1);

  // Show pages around current page
  if (currentPage > 3) {
    pages.push('...');
  }

  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }

  // Always show last page
  if (currentPage < totalPages - 2) {
    pages.push('...');
  }
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="min-w-[44px] min-h-[44px]"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page as number)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className="min-w-[44px] min-h-[44px]"
          >
            {page}
          </Button>
        );
      })}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="min-w-[44px] min-h-[44px]"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
