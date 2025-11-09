"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface Suggestion {
  id: string;
  eventName: string;
  date: string;
  sport: string;
  teams: string;
  status: string;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
}

/**
 * SearchAutocomplete Component
 * 
 * Provides real-time search suggestions as the user types.
 * Debounces API calls, shows loading state, and supports keyboard navigation.
 * 
 * Part of User Story 4 (P3) - Quick Event Search
 */
export function SearchAutocomplete({
  placeholder = 'Search events, teams, or players...',
  className = '',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(
          `${apiUrl}/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=10`
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && query.length >= 3) {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    router.push(`/events/${suggestion.id}`);
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleSearch = () => {
    if (query.length >= 3) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 3 && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 pr-10 min-h-[44px]"
          aria-label="Search events"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg max-h-[400px] overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0 ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.eventName}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {suggestion.teams}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(suggestion.date)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.sport}
                  </Badge>
                  <Badge
                    variant={suggestion.status === 'upcoming' ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {suggestion.status}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !loading && query.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
          No events found for &quot;{query}&quot;
        </div>
      )}

      {/* Minimum query length hint */}
      {showSuggestions && query.length > 0 && query.length < 3 && (
        <div className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
          Type at least 3 characters to search
        </div>
      )}
    </div>
  );
}
