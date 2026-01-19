Plan: High-Performance SVG Particle Background (Sports-Themed)

Goal
- Add a lightweight, high-performance sports-themed animated background to the Home hero using SVG particles (ball sprites) scoped to the Home page.

Approach (chosen)
- SVG-sprite + `<use>` instances for repeated shapes (sports balls, dot) combined with RAF-driven transform updates.
- Animate with GPU-accelerated transforms (translate/scale/rotate, opacity).
- Respect `prefers-reduced-motion` and reduce particle count on mobile/low-memory.

Files to add
- `client/components/particles/Particles.tsx`
  - React component rendering an absolute-positioned SVG container using an inline/linked `symbols.svg` sprite and `<use>` instances. Initialize particles with deterministic RNG; update transforms via `requestAnimationFrame` on existing DOM nodes. Expose intensity props and mobile sampling.

- `client/components/particles/symbols.svg`
  - SVG `<symbol>` entries: `ball-small`, `ball-medium`, `ball-large`, `dot`. Keep paths simple (stylized ball shapes) and use CSS variables for colors.

- `client/components/particles/particles.css`
  - Container positioning: absolute/cover hero, `pointer-events: none`, `contain: paint`, `will-change: transform` on animated groups. Add `@media (prefers-reduced-motion)` rules to disable or slow animations, and a mobile query to reduce particle count.

Files to edit
- `client/app/page.tsx`
  - Add `import Particles from '@/components/particles/Particles'` near top imports.
  - Insert `<Particles />` as the first child inside the hero `<section>` so it sits behind hero content (use positioned wrapper and z-index).

- `client/app/globals.css`
  - Add CSS variables for particle accent colors or import `particles.css`. Ensure Tailwind utilities and global CSS do not conflict with particle styles.

Performance & Implementation Checklist (high-performance focus)
- Use `<symbol>` + `<use>` so shapes are defined once and reused.
- Keep particle count modest: start with 20–40 on desktop; <=10 on mobile.
- Animate only `transform` and `opacity` to leverage GPU compositing.
- Use `will-change: transform` sparingly on containers or animated groups; avoid promoting hundreds of layers.
- Batch runtime updates via `requestAnimationFrame`; update `transform` attributes on existing `<use>` nodes — do not recreate nodes per frame.
- Use `contain: paint` and `pointer-events: none` to limit reflows and interaction side-effects.
- Respect `prefers-reduced-motion`: disable RAF animations and optionally show a static subtle background.
- Provide simple device heuristics to reduce intensity on low-memory/low-power devices (navigator.deviceMemory heuristic or CSS media queries).

Accessibility
- Mark decorative SVGs with `aria-hidden="true"` and `role="presentation"`.
- Ensure background does not interfere with contrast; keep hero overlay or semi-opaque layer if needed.
- Do not capture focus; ensure `pointer-events: none` on background.
- Respect `prefers-reduced-motion`.

Integration Steps (succinct)
1. Add `Particles.tsx`, `symbols.svg`, and `particles.css` in `client/components/particles/`.
2. Import `Particles` in `client/app/page.tsx` and insert `<Particles />` inside the hero `<section>`.
3. Implement RAF-driven transform updates in `Particles.tsx` updating `transform` on `<use>` instances; avoid per-frame DOM creation.
4. Wire responsive counts and `prefers-reduced-motion` rules; tune styles in `particles.css`.
5. Test desktop/mobile with devtools (Performance/Rendering), lower particles if jank persists; consider canvas fallback if needed.

Estimate
- Effort: medium — ~4 hours (component scaffold 1h, SVG + CSS 1h, animation logic + reduced-motion 1h, integration + QA 1h).
- If adding Canvas fallback, estimate increases to 8–12h.

Notes
- Mounting is scoped to Home by default; can be added to `client/app/layout.tsx` for site-wide effect (optional).
- Keep shapes simple to minimize SVG path cost; use CSS variables for colors so theming remains easy.

End of plan.
