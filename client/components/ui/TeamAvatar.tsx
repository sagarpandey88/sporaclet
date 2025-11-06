"use client";
import React, { useMemo, useState } from 'react';

interface TeamAvatarProps {
  logoUrl?: string | null;
  name?: string | null;
  shortName?: string | null;
  className?: string; // tailwind classes for sizing/shape
  alt?: string;
}

export default function TeamAvatar({
  logoUrl,
  name,
  shortName,
  className = 'h-8 w-8',
  alt,
}: TeamAvatarProps) {
  const [failed, setFailed] = useState(false);

  const initials = useMemo(() => {
    const source = (shortName || name || '').trim();
    if (!source) return '';
    // If shortName looks like an acronym (all uppercase), use up to 3 chars
    if (/^[A-Z0-9 ]+$/.test(source) && source.length <= 4) {
      return source.replace(/[^A-Z0-9]/g, '').slice(0, 3);
    }
    // Split into words and take first letter of up to two words
    const parts = source.split(/[^A-Za-z0-9]+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  }, [shortName, name]);

  // Simple deterministic background color derived from name
  const bgColor = useMemo(() => {
    const s = (shortName || name || 'team').toLowerCase();
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    const colors = [
      'bg-sky-100 text-sky-700',
      'bg-rose-100 text-rose-700',
      'bg-emerald-100 text-emerald-700',
      'bg-violet-100 text-violet-700',
      'bg-amber-100 text-amber-700',
      'bg-indigo-100 text-indigo-700',
      'bg-lime-100 text-lime-700',
    ];
    return colors[Math.abs(hash) % colors.length];
  }, [shortName, name]);

  if (logoUrl && !failed) {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img
        src={logoUrl}
        alt={alt || name || shortName || 'team logo'}
        className={`${className} object-contain flex-shrink-0`
        }
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt || name || shortName || 'team initials'}
      className={`inline-flex items-center justify-center font-semibold ${bgColor} ${className}`}
    >
      <span className="select-none">{initials}</span>
    </div>
  );
}
