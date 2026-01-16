import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchBox({
  value,
  onChange,
  placeholder = 'Search events or teams...',
  debounceMs = 300,
  className = '',
}: SearchBoxProps) {
  const [localValue, setLocalValue] = useState(value);

  // Only invoke onChange when user explicitly submits (Enter key)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onChange(localValue);
          }
        }}
        className="pl-10 min-h-[44px]"
        aria-label="Search events"
      />
    </div>
  );
}
