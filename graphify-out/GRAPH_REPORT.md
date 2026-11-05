# Graph Report - frontend  (2026-11-06)

## Corpus Check
- 127 files · ~55,742 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 3, .zip 3, .example 2)

## Summary
- 825 nodes · 2144 edges · 46 communities (35 shown, 11 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4db8bcbb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- buildings.ts
- Medicine.tsx
- package.json
- verify.mjs
- Header.tsx
- compilerOptions
- Programmes.tsx
- Hero.tsx
- TODO
- CLAUDE.md
- models.py
- test_core.py
- AskProvider.tsx
- documents.py
- main.py
- get_settings
- emergency.ts
- Home.tsx
- main.py
- Section
- rag.py
- App.tsx
- AskAnswer.tsx
- useAsk
- ChatWidget.tsx
- Photo
- react
- understand_query
- services
- iso.ts
- CampusMap.tsx
- Home.tsx
- scene.ts
- followUps.ts
- Settings
- ingest_all.sh script
- Life.tsx
- framer-motion
- pen.ts
- test_crawler_fails_closed_when_robots_cannot_be_checked

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 43 edges
2. `react` - 41 edges
3. `Section()` - 31 edges
4. `Document` - 30 edges
5. `DocumentChunk` - 25 edges
6. `CampusMap()` - 21 edges
7. `Button()` - 20 edges
8. `App()` - 19 edges
9. `Photo()` - 19 edges
10. `Pen` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Support chat follow-up questions` --references--> `followUps()`  [INFERRED]
  TODO.md → src/lib/followUps.ts
- `Admin` --references--> `title()`  [INFERRED]
  README.md → src/components/ScrollIndex.tsx
- `upgrade()` --uses--> `Base`  [INFERRED]
  backend/alembic/versions/20261105_01_initial_schema.py → backend/app/database/connection.py
- `downgrade()` --uses--> `Base`  [INFERRED]
  backend/alembic/versions/20261105_01_initial_schema.py → backend/app/database/connection.py
- `test_groq_provider_uses_its_own_key_and_base_url()` --calls--> `get_settings()`  [EXTRACTED]
  backend/tests/test_core.py → backend/app/config.py

## Import Cycles
- None detected.

## Communities (46 total, 11 thin omitted)

### Community 0 - "buildings.ts"
Cohesion: 0.18
Nodes (35): V3, academic(), auditorium(), busTerminus(), C, clockTower(), cornice(), court() (+27 more)

### Community 1 - "Medicine.tsx"
Cohesion: 0.28
Nodes (12): Section(), About(), Anatomy(), Clinical(), Cta(), Ecg(), Finder(), Medicine() (+4 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, @fontsource/cormorant-garamond@^5.3.0, @fontsource/dm-sans@^5.3.0, framer-motion@^14.9.1, gsap@^3.15.1, lenis@^1.3.27, react@^19.3.1, react-dom@^19.3.1 (+34 more)

### Community 3 - "verify.mjs"
Cohesion: 0.05
Nodes (19): playwright@^1.64.1, playwright, ANSWERED, server, UNVERIFIED, errors, { photos, slots }, seen (+11 more)

### Community 4 - "Header.tsx"
Cohesion: 0.22
Nodes (12): EmergencyButton(), IntroEmergencyButton(), Props, Footer(), SIZES, Utility(), Header(), headerKey() (+4 more)

### Community 5 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 6 - "Programmes.tsx"
Cohesion: 0.23
Nodes (11): Compare(), Estimator(), Finder(), inr(), levelName(), Personas(), Programmes(), Props (+3 more)

### Community 7 - "Hero.tsx"
Cohesion: 0.29
Nodes (4): explored, listeners, subscribe(), useExplored()

### Community 8 - "TODO"
Cohesion: 0.18
Nodes (10): Adding or changing a photo, Differences from the references, Facts to confirm, Hidden blocks, Needs your attention, Photo map, Stock sources, Support chat and emergency: check before shipping (+2 more)

### Community 10 - "models.py"
Cohesion: 0.09
Nodes (21): downgrade(), upgrade(), Base, get_db(), Conversation, Feedback, Message, utc_now() (+13 more)

### Community 11 - "test_core.py"
Cohesion: 0.12
Nodes (24): Document, DocumentChunk, generate_answer(), GeneratedAnswer, _read_result(), RetrievedChunk, test_ambiguous_fee_query_requests_clarification(), test_answer_generation_names_the_missing_provider_key() (+16 more)

### Community 12 - "AskProvider.tsx"
Cohesion: 0.16
Nodes (21): AskContext, AskContextValue, AskProvider(), CheckIn, isTyping(), loadTurns(), newId(), Turn (+13 more)

### Community 14 - "main.py"
Cohesion: 0.11
Nodes (19): chunk_text(), main(), _fetch_bytes(), fetch_official_pdf(), fetch_public_document(), _session(), parse_html(), index_document() (+11 more)

### Community 15 - "get_settings"
Cohesion: 0.10
Nodes (19): get_settings(), _create_engine(), PortableVector, _client(), _embed_locally(), embed_text(), _local_model(), _cosine_similarity() (+11 more)

### Community 16 - "emergency.ts"
Cohesion: 0.13
Nodes (23): CallRow(), needsConfirm(), PhoneIcon(), Props, EmergencyContent(), LocationHelper(), Props, EmergencySheet() (+15 more)

### Community 17 - "Home.tsx"
Cohesion: 0.19
Nodes (7): Tag(), Countdown(), LAND, Location, NewsEvents(), NewsItem, Testimonial

### Community 18 - "main.py"
Cohesion: 0.07
Nodes (10): verify_database_connection(), run_scheduler(), lifespan(), root(), service_unavailable_handler(), unexpected_error_handler(), RateLimitMiddleware, health_check() (+2 more)

### Community 19 - "Section"
Cohesion: 0.25
Nodes (12): Stat(), Careers(), Cta(), Dean(), Departments(), Engineering(), Glance(), Research() (+4 more)

### Community 20 - "rag.py"
Cohesion: 0.24
Nodes (11): chat(), ChatRequest, ChatResponse, FeedbackRequest, SourceReference, answer_question(), _normalize_citations(), _official_document() (+3 more)

### Community 21 - "App.tsx"
Cohesion: 0.07
Nodes (35): Admin, Backend setup, Database and deployment, Environment, Groq with local embeddings, Ingesting public knowledge, Public, REST API (+27 more)

### Community 22 - "AskAnswer.tsx"
Cohesion: 0.26
Nodes (15): AskAnswer(), Bot(), clock(), Formatted(), inline(), isHttps(), Mine(), NextSteps() (+7 more)

### Community 23 - "useAsk"
Cohesion: 0.20
Nodes (12): AskBar(), AskExamples(), Props, useAsk(), AskTrigger(), Props, SearchIcon(), checkSafety() (+4 more)

### Community 24 - "ChatWidget.tsx"
Cohesion: 0.24
Nodes (13): Chevron(), OptionCard(), OptionRow(), TopicRows(), ChatWidget(), greeted(), Launcher(), useClearCard() (+5 more)

### Community 25 - "Photo"
Cohesion: 0.18
Nodes (13): Breadcrumb(), PageHero(), Props, Photo(), Reveal(), manifest, PhotoEntry, photoFor() (+5 more)

### Community 26 - "react"
Cohesion: 0.25
Nodes (12): gsap, react, Props, Heading(), Props, tones, Figure(), Props (+4 more)

### Community 27 - "understand_query"
Cohesion: 0.24
Nodes (10): _academic_year(), _category(), _normalize_year(), QueryUnderstanding, _terms(), understand_query(), test_citation_variants_are_normalized(), test_natural_questions_are_in_scope() (+2 more)

### Community 28 - "services"
Cohesion: 0.17
Nodes (11): key, sync, value, services, dockerContext, dockerfilePath, envVars, healthCheckPath (+3 more)

### Community 29 - "iso.ts"
Cohesion: 0.18
Nodes (19): backToFront(), behind(), hull(), project(), Quarter, Rect, screen(), toPath() (+11 more)

### Community 30 - "CampusMap.tsx"
Cohesion: 0.19
Nodes (17): CampusExplorer(), CampusDirectory(), Glyph(), glyphs, Props, BuildingPortrait(), CampusMap(), Count() (+9 more)

### Community 31 - "Home.tsx"
Cohesion: 0.18
Nodes (17): react-router-dom, Button(), Props, styles, Cta(), Home(), Research(), Trust() (+9 more)

### Community 32 - "scene.ts"
Cohesion: 0.16
Nodes (18): cache, dist(), edgeLength(), inRect(), lamps, leaf, nearestOnRoads(), nodes (+10 more)

### Community 33 - "followUps.ts"
Cohesion: 0.43
Nodes (6): AskSource, followUps(), hits(), key(), matches(), Support chat follow-up questions

### Community 42 - "Life.tsx"
Cohesion: 0.17
Nodes (15): palette, BEAM, build(), COLOURS, dirIndex(), DIRS, fleet(), Life (+7 more)

### Community 43 - "framer-motion"
Cohesion: 0.29
Nodes (8): framer-motion, HorizontalScroll(), Props, PhotoPanel(), Props, Disciplines(), Schools(), Discover()

### Community 44 - "pen.ts"
Cohesion: 0.24
Nodes (8): View, Props, dusk(), hex(), Op, paletteCss(), table, Scene

## Knowledge Gaps
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Medicine.tsx`, `package.json`, `Header.tsx`, `Programmes.tsx`, `Hero.tsx`, `Life.tsx`, `framer-motion`, `AskProvider.tsx`, `emergency.ts`, `Home.tsx`, `Section`, `App.tsx`, `AskAnswer.tsx`, `useAsk`, `ChatWidget.tsx`, `Photo`, `CampusMap.tsx`, `Home.tsx`?**
  _High betweenness centrality (0.221) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `Document` (e.g. with `refresh_indexed_sources()` and `admin_stats()`) actually correct?**
  _`Document` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05603864734299517 - nodes in this community are weakly interconnected._
- **Why does `playwright` connect `verify.mjs` to `package.json`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `DocumentChunk` (e.g. with `admin_stats()` and `list_documents()`) actually correct?**
  _`DocumentChunk` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `verify.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.0545876887340302 - nodes in this community are weakly interconnected._
- **Why does `followUps()` connect `followUps.ts` to `AskAnswer.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._