"use client";

import React, { useEffect, useRef } from 'react';
import './particles.css';

type Particle = {
  id: number;
  type: 'dot' | 'ball-small' | 'ball-medium' | 'ball-large';
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number; // rotation
  vr: number; // rotation velocity
  s: number; // scale
  vs: number; // scale velocity
  opacity: number;
  vOpacity: number;
};

function seededRandom(seed: number) {
  // simple LCG
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function Particles({ intensity = 1, forceMotion = false }: { intensity?: number; forceMotion?: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const usesRef = useRef<Array<SVGUseElement | null>>([]);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // respect forceMotion to optionally bypass user `prefers-reduced-motion` (useful for dev)
    const prefersReduced = !forceMotion && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    console.log('[particles] prefersReduced=', prefersReduced, 'forceMotion=', forceMotion);

    const deviceMemory = (navigator as any).deviceMemory || 4;
    const vw = Math.max(320, window.innerWidth || 1024);

    const base = vw > 1200 ? 32 : vw > 800 ? 24 : 12;
    const maxParticles = Math.max(6, Math.round(base * Math.min(1.5, deviceMemory / 4) * intensity));

    // deterministic seed based on page size
    const rand = seededRandom(Math.floor(vw + deviceMemory * 13));

    const types: Particle['type'][] = ['ball-small', 'ball-medium', 'ball-large', 'dot'];
    particlesRef.current = Array.from({ length: maxParticles }).map((_, i) => {
      const t = types[Math.floor(rand() * types.length)];
      const s = 0.5 + rand() * 1.1;
      return {
        id: i,
        type: t,
        x: rand() * vw,
        y: rand() * (window.innerHeight || 600) * 0.6,
        vx: (rand() - 0.5) * 0.3 * (t === 'dot' ? 0.5 : 1.5),
        vy: (rand() - 0.5) * 0.15,
        r: rand() * 360,
        vr: (rand() - 0.5) * 0.2,
        s,
        vs: (rand() - 0.5) * 0.005,
        opacity: 0.5 + rand() * 0.6,
        vOpacity: (rand() - 0.5) * 0.01,
      };
    });

    // apply initial transforms/opacity and optionally animate
    const applyTransformsOnce = () => {
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const el = usesRef.current[i];
        if (el) {
          el.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.r.toFixed(2)}) scale(${p.s.toFixed(3)})`);
          el.setAttribute('opacity', p.opacity.toFixed(3));
        }
      }
    };

    if (prefersReduced) {
      // still render a subtle static background but avoid RAF
      applyTransformsOnce();
      console.log('[particles] reduced-motion active — applied static transforms');
      return; // no RAF loop
    }

    console.log('[particles] starting RAF — particles=', particlesRef.current.length);

    // animation loop — update transforms on existing <use> nodes
    let last = performance.now();

    let tickCount = 0;
    const tick = (now: number) => {
      if (tickCount === 0) console.log('[particles] tick start');
      tickCount++;
      const dt = Math.min(50, now - last) / 1000; // cap delta
      last = now;

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * (40 * dt);
        p.y += p.vy * (40 * dt);
        p.r += p.vr * (40 * dt);
        p.s += p.vs * (40 * dt);
        p.opacity = Math.max(0, Math.min(1, p.opacity + p.vOpacity * (40 * dt)));

        // wrap horizontally
        const width = vw;
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;

        // small vertical drift bounds
        const maxY = (window.innerHeight || 800) * 0.6;
        if (p.y < -50) p.y = maxY + 50;
        if (p.y > maxY + 50) p.y = -50;

        const el = usesRef.current[i];
        if (el) {
          // use GPU-friendly transforms
          el.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.r.toFixed(2)}) scale(${p.s.toFixed(3)})`);
          el.setAttribute('opacity', p.opacity.toFixed(3));
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [intensity]);

  // Render particles as <use> referencing inline symbols. We render all use elements once.
  const particles = particlesRef.current;
  const count = particles.length || 20;

  return (
    <div ref={rootRef} className="particles-root" aria-hidden="true" role="presentation">
      {/* inline sprite (kept hidden) — duplicate of symbols.svg so sprite is available in-document */}
      <svg style={{ display: 'none' }} aria-hidden="true">
        <symbol id="ball-small" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="var(--particle-accent)" />
          <path d="M4 12c4-2 8-2 16 0" stroke="var(--particle-accent-2)" strokeWidth="1.2" fill="none" opacity="0.9" />
        </symbol>

        <symbol id="ball-medium" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="var(--particle-accent)" />
          <path d="M6 16c6-3 12-3 20 0" stroke="var(--particle-accent-2)" strokeWidth="1.6" fill="none" opacity="0.9" />
        </symbol>

        <symbol id="ball-large" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="var(--particle-accent)" />
          <path d="M8 20c8-4 16-4 32 0" stroke="var(--particle-accent-2)" strokeWidth="2" fill="none" opacity="0.9" />
        </symbol>

        <symbol id="dot" viewBox="0 0 6 6">
          <circle cx="3" cy="3" r="3" fill="var(--particle-dot)" />
        </symbol>
      </svg>

      {/* Use a stable, static viewBox to avoid SSR/client hydration mismatches */}
      <svg className="particles-svg" width="100%" height="100%" viewBox="0 0 1600 900" preserveAspectRatio="none">
        {/* Render blank uses — transforms set by RAF */}
        {Array.from({ length: count }).map((_, i) => {
          const refId = i % 4 === 0 ? 'ball-small' : i % 4 === 1 ? 'ball-medium' : i % 4 === 2 ? 'ball-large' : 'dot';
          return (
            <use
              key={i}
              ref={(el: SVGUseElement | null) => (usesRef.current[i] = el)}
              href={`#${refId}`}
              xlinkHref={`#${refId}`}
              x="0"
              y="0"
              className="particles-layer"
              opacity="0"
            />
          );
        })}
      </svg>

      <div className="particles-overlay" aria-hidden="true" />
    </div>
  );
}
