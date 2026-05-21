# BBB — Big Boys Bombs

Industrial-grade strategic-weapons procurement platform. Single-page application.

> Cold-war black-ops crossed with deep-space sci-fi. Absolute black, white
> star-particles, retro green CRT HUD. Crimson red is reserved for danger.

## Stack

- **Vite 5** + **TypeScript 5.6** + **React 18**
- **Three.js** via **@react-three/fiber** + **@react-three/drei**
- **Tailwind CSS v4** (Vite plugin, CSS-first config)
- **Zustand** state machine
- *(future)* GSAP timelines, Recharts analytics, Howler.js audio, postprocessing glitch

## Scripts

```bash
npm install           # one-time
npm run dev           # http://localhost:5173
npm run build         # type-check + production bundle in dist/
npm run preview       # serve the built bundle
npm run typecheck     # tsc -b --noEmit
```

## Milestone status

- [x] **M1 — Foundation & persistent canvas** · starfield, app state machine, HUD overlay routing
- [ ] M2 — Landing scene: cube + morphing particle rings + raycast buttons
- [ ] M3 — Glitch transition + scroll compass HUD
- [ ] M4 — Arsenal + Cart overlays + Wireframe Earth
- [ ] M5 — Simulator + Information + Audio + Polish

Full plan: see `/root/.claude/plans/udelej-co-nejvice-rozashlej-misty-crescent.md`.
