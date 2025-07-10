'use client';

import { Button } from '@/components/ui/button';
import { sportTypes } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface SportFilterProps {
  selectedSport: string;
  onSportChange: (sport: string) => void;
}

export function SportFilter({ selectedSport, onSportChange }: SportFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sportTypes.map((sport) => (
        <Button
          key={sport.value}
          variant={selectedSport === sport.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSportChange(sport.value)}
          className={cn(
            'flex items-center gap-2 transition-all',
            selectedSport === sport.value && 'shadow-sm'
          )}
        >
          <span>{sport.icon}</span>
          {sport.label}
        </Button>
      ))}
    </div>
  );
}