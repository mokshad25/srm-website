# Graph Report - frontend  (2026-11-06)

## Corpus Check
- 126 files · ~54,264 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 3, .zip 3, .example 2)

## Summary
- 817 nodes · 2123 edges · 42 communities (33 shown, 9 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `047d99f2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scene.ts
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
- admin.py
- main.py
- get_settings
- emergency.ts
- Home.tsx
- rate_limit.py
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
- health.py
- SRMIST Intelligence Layer
- Button
- Toast.tsx
- followUps.ts
- Settings
- ingest_all.sh script

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 43 edges
2. `react` - 40 edges
3. `Section()` - 31 edges
4. `Document` - 30 edges
5. `DocumentChunk` - 25 edges
6. `Button()` - 20 edges
7. `App()` - 19 edges
8. `Photo()` - 19 edges
9. `CampusMap()` - 18 edges
10. `Pen` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Admin` --references--> `title()`  [INFERRED]
  README.md → src/components/ScrollIndex.tsx
- `Support chat follow-up questions` --references--> `followUps()`  [INFERRED]
  TODO.md → src/lib/followUps.ts
- `upgrade()` --uses--> `Base`  [INFERRED]
  backend/alembic/versions/20261105_01_initial_schema.py → backend/app/database/connection.py
- `downgrade()` --uses--> `Base`  [INFERRED]
  backend/alembic/versions/20261105_01_initial_schema.py → backend/app/database/connection.py
- `_create_engine()` --calls--> `get_settings()`  [EXTRACTED]
  backend/app/database/connection.py → backend/app/config.py

## Import Cycles
- None detected.

## Communities (42 total, 9 thin omitted)

### Community 0 - "scene.ts"
Cohesion: 0.06
Nodes (104): backToFront(), behind(), hull(), project(), Quarter, Rect, screen(), toPath() (+96 more)

### Community 1 - "Medicine.tsx"
Cohesion: 0.15
Nodes (18): framer-motion, HorizontalScroll(), Props, PhotoPanel(), Disciplines(), About(), Anatomy(), Clinical() (+10 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, @fontsource/cormorant-garamond@^5.3.0, @fontsource/dm-sans@^5.3.0, framer-motion@^14.9.1, gsap@^3.15.1, lenis@^1.3.27, react@^19.3.1, react-dom@^19.3.1 (+34 more)

### Community 3 - "verify.mjs"
Cohesion: 0.05
Nodes (19): playwright@^1.64.1, playwright, ANSWERED, server, UNVERIFIED, errors, { photos, slots }, seen (+11 more)

### Community 4 - "Header.tsx"
Cohesion: 0.19
Nodes (15): react-router-dom, EmergencyButton(), IntroEmergencyButton(), Props, Footer(), SIZES, Utility(), Header() (+7 more)

### Community 5 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 6 - "Programmes.tsx"
Cohesion: 0.25
Nodes (11): Compare(), Estimator(), Finder(), inr(), levelName(), Personas(), Programmes(), Props (+3 more)

### Community 7 - "Hero.tsx"
Cohesion: 0.22
Nodes (9): explored, listeners, subscribe(), useExplored(), ease, ExploredCard(), Hero(), Line() (+1 more)

### Community 8 - "TODO"
Cohesion: 0.18
Nodes (10): Adding or changing a photo, Differences from the references, Facts to confirm, Hidden blocks, Needs your attention, Photo map, Stock sources, Support chat and emergency: check before shipping (+2 more)

### Community 10 - "models.py"
Cohesion: 0.09
Nodes (15): downgrade(), upgrade(), Base, _create_engine(), get_db(), Conversation, Feedback, Message (+7 more)

### Community 11 - "test_core.py"
Cohesion: 0.13
Nodes (23): Document, DocumentChunk, generate_answer(), GeneratedAnswer, _read_result(), RetrievedChunk, test_ambiguous_fee_query_requests_clarification(), test_answer_generation_names_the_missing_provider_key() (+15 more)

### Community 12 - "AskProvider.tsx"
Cohesion: 0.17
Nodes (20): AskContext, AskContextValue, AskProvider(), isTyping(), loadTurns(), newId(), Turn, ask() (+12 more)

### Community 13 - "admin.py"
Cohesion: 0.10
Nodes (18): chunk_text(), index_document(), root(), admin_stats(), delete_document(), ingest_source(), list_documents(), list_feedback() (+10 more)

### Community 14 - "main.py"
Cohesion: 0.12
Nodes (14): main(), _fetch_bytes(), fetch_official_pdf(), fetch_public_document(), parse_html(), parse_pdf(), refresh_indexed_sources(), run_scheduler() (+6 more)

### Community 15 - "get_settings"
Cohesion: 0.12
Nodes (18): get_settings(), _client(), _embed_locally(), embed_text(), _local_model(), _cosine_similarity(), _normalized_content(), _official_url_clause() (+10 more)

### Community 16 - "emergency.ts"
Cohesion: 0.13
Nodes (23): CallRow(), needsConfirm(), PhoneIcon(), Props, EmergencyContent(), LocationHelper(), Props, EmergencySheet() (+15 more)

### Community 17 - "Home.tsx"
Cohesion: 0.16
Nodes (15): Stat(), Tag(), Cta(), Home(), Research(), Trust(), Countdown(), LAND (+7 more)

### Community 18 - "rate_limit.py"
Cohesion: 0.11
Nodes (4): _session(), RateLimitMiddleware, ask(), main()

### Community 19 - "Section"
Cohesion: 0.20
Nodes (17): Heading(), Props, Reveal(), Section(), tones, useLineReveal(), Careers(), Cta() (+9 more)

### Community 20 - "rag.py"
Cohesion: 0.23
Nodes (12): chat(), ChatRequest, ChatResponse, FeedbackRequest, SourceReference, answer_question(), _normalize_citations(), _official_document() (+4 more)

### Community 21 - "App.tsx"
Cohesion: 0.20
Nodes (12): App(), CampusExplorer, ChatWidget, Engineering, Home, LearnLeapLead, Medicine, ScrollManager() (+4 more)

### Community 22 - "AskAnswer.tsx"
Cohesion: 0.22
Nodes (16): AskAnswer(), Bot(), clock(), Formatted(), inline(), isHttps(), Mine(), NextSteps() (+8 more)

### Community 23 - "useAsk"
Cohesion: 0.20
Nodes (12): AskBar(), AskExamples(), Props, useAsk(), AskTrigger(), Props, SearchIcon(), checkSafety() (+4 more)

### Community 24 - "ChatWidget.tsx"
Cohesion: 0.24
Nodes (14): Chevron(), OptionCard(), OptionRow(), TopicRows(), ChatWidget(), greeted(), Launcher(), useClearCard() (+6 more)

### Community 25 - "Photo"
Cohesion: 0.20
Nodes (12): Breadcrumb(), PageHero(), Props, Photo(), manifest, PhotoEntry, photoFor(), ResolvedPhoto (+4 more)

### Community 26 - "react"
Cohesion: 0.29
Nodes (10): gsap, react, PageWipe(), Props, Props, Figure(), Props, prefersReduced() (+2 more)

### Community 27 - "understand_query"
Cohesion: 0.27
Nodes (9): _academic_year(), _category(), _normalize_year(), QueryUnderstanding, _terms(), understand_query(), test_natural_questions_are_in_scope(), test_query_understanding_resolves_short_follow_up_from_history() (+1 more)

### Community 28 - "services"
Cohesion: 0.17
Nodes (11): key, sync, value, services, dockerContext, dockerfilePath, envVars, healthCheckPath (+3 more)

### Community 29 - "health.py"
Cohesion: 0.25
Nodes (4): verify_database_connection(), service_unavailable_handler(), unexpected_error_handler(), health_check()

### Community 30 - "SRMIST Intelligence Layer"
Cohesion: 0.18
Nodes (10): Admin, Backend setup, Database and deployment, Environment, Groq with local embeddings, Ingesting public knowledge, Public, REST API (+2 more)

### Community 31 - "Button"
Cohesion: 0.31
Nodes (6): Button(), Props, styles, useMagnetic(), CampusExplorer(), CampusSection()

### Community 32 - "Toast.tsx"
Cohesion: 0.33
Nodes (8): emit(), Item, items, listeners, One(), subscribe(), toast(), Toaster()

### Community 33 - "followUps.ts"
Cohesion: 0.43
Nodes (6): AskSource, followUps(), hits(), key(), matches(), Support chat follow-up questions

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Toast.tsx`, `Medicine.tsx`, `package.json`, `scene.ts`, `Header.tsx`, `Programmes.tsx`, `Hero.tsx`, `AskProvider.tsx`, `emergency.ts`, `Home.tsx`, `Section`, `App.tsx`, `AskAnswer.tsx`, `useAsk`, `ChatWidget.tsx`, `Photo`, `Button`?**
  _High betweenness centrality (0.218) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `Document` (e.g. with `refresh_indexed_sources()` and `admin_stats()`) actually correct?**
  _`Document` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Should `scene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055627987831377665 - nodes in this community are weakly interconnected._
- **Why does `playwright` connect `verify.mjs` to `package.json`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `DocumentChunk` (e.g. with `admin_stats()` and `list_documents()`) actually correct?**
  _`DocumentChunk` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `Medicine.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14855072463768115 - nodes in this community are weakly interconnected._
- **Why does `followUps()` connect `followUps.ts` to `AskAnswer.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._