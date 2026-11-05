# Graph Report - frontend  (2026-11-05)

## Corpus Check
- 66 files · ~36,815 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: .example 1, .css 1)

## Summary
- 436 nodes · 1119 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `80559671`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scene.ts
- Home.tsx
- package.json
- verify.mjs
- App.tsx
- compilerOptions
- Programmes.tsx
- Hero.tsx
- TODO
- CLAUDE.md
- buildings.ts
- AskProvider.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 30 edges
2. `Section()` - 30 edges
3. `Pen` - 18 edges
4. `Photo()` - 17 edges
5. `CampusMap()` - 16 edges
6. `col()` - 16 edges
7. `Button()` - 15 edges
8. `compilerOptions` - 15 edges
9. `windows()` - 14 edges
10. `App()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `AskPanel()`  [EXTRACTED]
  src/App.tsx → src/components/ask/AskPanel.tsx
- `App()` --calls--> `AskProvider()`  [EXTRACTED]
  src/App.tsx → src/components/ask/AskProvider.tsx
- `PageHero()` --calls--> `Breadcrumb()`  [EXTRACTED]
  src/components/PageHero.tsx → src/components/Breadcrumb.tsx
- `Hero()` --calls--> `Button()`  [EXTRACTED]
  src/sections/home/Hero.tsx → src/components/Button.tsx
- `Finder()` --calls--> `Button()`  [EXTRACTED]
  src/sections/home/Programmes.tsx → src/components/Button.tsx

## Import Cycles
- None detected.

## Communities (12 total, 1 thin omitted)

### Community 0 - "scene.ts"
Cohesion: 0.06
Nodes (70): backToFront(), behind(), hull(), project(), Quarter, Rect, screen(), toPath() (+62 more)

### Community 1 - "Home.tsx"
Cohesion: 0.06
Nodes (62): Button(), Props, styles, HorizontalScroll(), Props, PageHero(), Props, Photo() (+54 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (45): dependencies, @fontsource/instrument-serif@^5.3.0, @fontsource/inter-tight@^5.3.0, @fontsource/sora@^5.3.0, framer-motion@^14.9.1, gsap@^3.15.1, lenis@^1.3.27, react@^19.3.1 (+37 more)

### Community 3 - "verify.mjs"
Cohesion: 0.07
Nodes (17): playwright@^1.64.1, playwright, ANSWERED, server, UNVERIFIED, errors, { photos, slots }, seen (+9 more)

### Community 4 - "App.tsx"
Cohesion: 0.11
Nodes (27): react, react-router-dom, App(), Engineering, Home, LearnLeapLead, Medicine, ScrollManager() (+19 more)

### Community 5 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 6 - "Programmes.tsx"
Cohesion: 0.24
Nodes (10): Tag(), Compare(), Estimator(), Finder(), inr(), levelName(), Personas(), Programmes() (+2 more)

### Community 7 - "Hero.tsx"
Cohesion: 0.22
Nodes (9): explored, listeners, subscribe(), useExplored(), ease, ExploredCard(), Hero(), Line() (+1 more)

### Community 8 - "TODO"
Cohesion: 0.20
Nodes (9): Adding or changing a photo, Differences from the references, Facts to confirm, Hidden blocks, Needs your attention, Photo map, Stock sources, TODO (+1 more)

### Community 10 - "buildings.ts"
Cohesion: 0.19
Nodes (34): V3, academic(), auditorium(), busTerminus(), C, clockTower(), cornice(), court() (+26 more)

### Community 12 - "AskProvider.tsx"
Cohesion: 0.09
Nodes (43): AskAnswer(), Formatted(), inline(), isHttps(), Notice(), Result(), Skeleton(), Sources() (+35 more)

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `scene.ts`, `Home.tsx`, `package.json`, `Programmes.tsx`, `Hero.tsx`, `AskProvider.tsx`?**
  _High betweenness centrality (0.424) - this node is a cross-community bridge._
- **Should `scene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06456140350877193 - nodes in this community are weakly interconnected._
- **Why does `playwright` connect `verify.mjs` to `package.json`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Should `Home.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06292749658002736 - nodes in this community are weakly interconnected._
- **Why does `Section()` connect `Home.tsx` to `scene.ts`, `Programmes.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05442176870748299 - nodes in this community are weakly interconnected._
- **Should `verify.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06818181818181818 - nodes in this community are weakly interconnected._