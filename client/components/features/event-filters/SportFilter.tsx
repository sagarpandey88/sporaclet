import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SportFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const sports = [
  { value: 'all', label: 'All Sports' },
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'cricket', label: 'Cricket' },
  { value: 'tennis', label: 'Tennis' },
];

export function SportFilter({ value, onChange, className = '' }: SportFilterProps) {
  return (
    <div className={`w-full sm:w-auto ${className}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="w-full sm:w-[180px] min-h-[44px]"
          aria-label="Filter by sport"
        >
          <SelectValue placeholder="Select sport" />
        </SelectTrigger>
        <SelectContent>
          {sports.map((sport) => (
            <SelectItem key={sport.value} value={sport.value}>
              {sport.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
