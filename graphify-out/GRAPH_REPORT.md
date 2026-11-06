# Graph Report - frontend  (2026-11-06)

## Corpus Check
- 133 files · ~60,375 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 3, .zip 3, .example 2)

## Summary
- 896 nodes · 2385 edges · 51 communities (39 shown, 12 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 147 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0fa02ee4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scene.ts
- Section
- package.json
- verify.mjs
- CampusPulse.tsx
- compilerOptions
- Programmes.tsx
- health.py
- TODO
- CLAUDE.md
- models.py
- test_core.py
- AskProvider.tsx
- admin.py
- main.py
- get_settings
- emergency.ts
- buildings.ts
- rate_limit.py
- Header.tsx
- re
- App.tsx
- AskAnswer.tsx
- useAsk
- ChatWidget.tsx
- Photo
- react
- understand_query
- services
- SRMIST Intelligence Layer
- CampusMap.tsx
- Home.tsx
- rag.py
- followUps.ts
- Settings
- ingest_all.sh script
- Life.tsx
- framer-motion
- Hero.tsx
- retrieval.py
- pen.ts
- Toast.tsx
- indexer.py
- RateLimitMiddleware
- documents.py

## God Nodes (most connected - your core abstractions)
1. `react` - 45 edges
2. `get_settings()` - 43 edges
3. `Section()` - 36 edges
4. `Document` - 30 edges
5. `DocumentChunk` - 25 edges
6. `Photo()` - 23 edges
7. `Button()` - 22 edges
8. `App()` - 21 edges
9. `CampusMap()` - 20 edges
10. `react-router-dom` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Support chat follow-up questions` --references--> `followUps()`  [INFERRED]
  TODO.md → src/lib/followUps.ts
- `Admin` --references--> `title()`  [INFERRED]
  README.md → src/components/ScrollIndex.tsx
- `upgrade()` --uses--> `Base`  [INFERRED]
  backend/alembic/versions/20261105_01_initial_schema.py → backend/app/database/connection.py
- `downgrade()` --uses--> `Base`  [INFERRED]
  backend/alembic/versions/20261105_01_initial_schema.py → backend/app/database/connection.py
- `_create_engine()` --calls--> `get_settings()`  [EXTRACTED]
  backend/app/database/connection.py → backend/app/config.py

## Import Cycles
- None detected.

## Communities (51 total, 12 thin omitted)

### Community 0 - "scene.ts"
Cohesion: 0.11
Nodes (41): backToFront(), behind(), hull(), Quarter, Rect, screen(), toPath(), turn() (+33 more)

### Community 1 - "Section"
Cohesion: 0.15
Nodes (25): Reveal(), Section(), Stat(), Careers(), Cta(), Dean(), Departments(), Engineering() (+17 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, @fontsource/cormorant-garamond@^5.3.0, @fontsource/dm-sans@^5.3.0, framer-motion@^14.9.1, gsap@^3.15.1, lenis@^1.3.27, react@^19.3.1, react-dom@^19.3.1 (+34 more)

### Community 3 - "verify.mjs"
Cohesion: 0.05
Nodes (19): playwright@^1.64.1, playwright, ANSWERED, server, UNVERIFIED, errors, { photos, slots }, seen (+11 more)

### Community 4 - "CampusPulse.tsx"
Cohesion: 0.09
Nodes (61): Empty(), EventFacts(), Filters(), ItemPhoto(), Provenance(), published(), ReadMore(), useHeaderBottom() (+53 more)

### Community 5 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 6 - "Programmes.tsx"
Cohesion: 0.23
Nodes (11): Compare(), Estimator(), Finder(), inr(), levelName(), Personas(), Programmes(), Props (+3 more)

### Community 7 - "health.py"
Cohesion: 0.17
Nodes (7): verify_database_connection(), refresh_indexed_sources(), run_scheduler(), lifespan(), service_unavailable_handler(), unexpected_error_handler(), health_check()

### Community 8 - "TODO"
Cohesion: 0.17
Nodes (11): Adding or changing a photo, Campus Pulse, Differences from the references, Facts to confirm, Hidden blocks, Needs your attention, Photo map, Stock sources (+3 more)

### Community 10 - "models.py"
Cohesion: 0.11
Nodes (13): downgrade(), upgrade(), Base, _create_engine(), get_db(), Conversation, Feedback, Message (+5 more)

### Community 11 - "test_core.py"
Cohesion: 0.14
Nodes (23): Document, DocumentChunk, ChatRequest, generate_answer(), GeneratedAnswer, RetrievedChunk, test_ambiguous_fee_query_requests_clarification(), test_answer_generation_names_the_missing_provider_key() (+15 more)

### Community 12 - "AskProvider.tsx"
Cohesion: 0.15
Nodes (22): AskContext, AskContextValue, AskProvider(), CheckIn, isTyping(), loadTurns(), newId(), Turn (+14 more)

### Community 13 - "admin.py"
Cohesion: 0.14
Nodes (13): index_document(), root(), admin_stats(), delete_document(), ingest_source(), list_documents(), list_feedback(), require_admin() (+5 more)

### Community 14 - "main.py"
Cohesion: 0.23
Nodes (8): main(), _fetch_bytes(), fetch_official_pdf(), fetch_public_document(), _session(), validate_official_url(), test_official_url_rejects_private_dns_results(), test_only_official_https_sources_are_accepted()

### Community 15 - "get_settings"
Cohesion: 0.11
Nodes (12): get_settings(), PortableVector, _client(), _embed_locally(), embed_text(), _local_model(), _read_result(), test_admin_endpoints_fail_closed_without_configured_secret() (+4 more)

### Community 16 - "emergency.ts"
Cohesion: 0.13
Nodes (23): CallRow(), needsConfirm(), PhoneIcon(), Props, EmergencyContent(), LocationHelper(), Props, EmergencySheet() (+15 more)

### Community 17 - "buildings.ts"
Cohesion: 0.24
Nodes (26): academic(), auditorium(), C, clockTower(), cornice(), court(), drawers, entrance() (+18 more)

### Community 19 - "Header.tsx"
Cohesion: 0.20
Nodes (14): EmergencyButton(), IntroEmergencyButton(), Props, Footer(), SIZES, Utility(), Header(), headerKey() (+6 more)

### Community 20 - "re"
Cohesion: 0.39
Nodes (4): parse_html(), parse_pdf(), clean_text(), test_html_parser_removes_navigation_and_keeps_heading()

### Community 21 - "App.tsx"
Cohesion: 0.15
Nodes (18): Admin, react-router-dom, App(), CampusExplorer, CampusPulse, ChatWidget, Engineering, Home (+10 more)

### Community 22 - "AskAnswer.tsx"
Cohesion: 0.29
Nodes (15): AskAnswer(), Bot(), clock(), Formatted(), inline(), isHttps(), Mine(), NextSteps() (+7 more)

### Community 23 - "useAsk"
Cohesion: 0.20
Nodes (12): AskBar(), AskExamples(), Props, useAsk(), AskTrigger(), Props, SearchIcon(), checkSafety() (+4 more)

### Community 24 - "ChatWidget.tsx"
Cohesion: 0.22
Nodes (13): Chevron(), OptionCard(), OptionRow(), TopicRows(), ChatWidget(), greeted(), Launcher(), useClearCard() (+5 more)

### Community 25 - "Photo"
Cohesion: 0.23
Nodes (10): Breadcrumb(), PageHero(), Props, Photo(), manifest, PhotoEntry, photoFor(), ResolvedPhoto (+2 more)

### Community 26 - "react"
Cohesion: 0.25
Nodes (12): gsap, react, Props, Heading(), Props, tones, Figure(), Props (+4 more)

### Community 27 - "understand_query"
Cohesion: 0.27
Nodes (10): _academic_year(), _category(), _normalize_year(), QueryUnderstanding, _terms(), understand_query(), test_citation_variants_are_normalized(), test_natural_questions_are_in_scope() (+2 more)

### Community 28 - "services"
Cohesion: 0.17
Nodes (11): key, sync, value, services, dockerContext, dockerfilePath, envVars, healthCheckPath (+3 more)

### Community 29 - "SRMIST Intelligence Layer"
Cohesion: 0.20
Nodes (9): Backend setup, Database and deployment, Environment, Groq with local embeddings, Ingesting public knowledge, Public, REST API, SRMIST Intelligence Layer (+1 more)

### Community 30 - "CampusMap.tsx"
Cohesion: 0.18
Nodes (19): project(), CampusExplorer(), CampusDirectory(), Glyph(), glyphs, Props, BuildingPortrait(), CampusMap() (+11 more)

### Community 31 - "Home.tsx"
Cohesion: 0.12
Nodes (20): Button(), Props, styles, Tag(), Cta(), Home(), Research(), Trust() (+12 more)

### Community 32 - "rag.py"
Cohesion: 0.23
Nodes (10): chat(), ChatResponse, FeedbackRequest, SourceReference, answer_question(), _normalize_citations(), _official_document(), _response() (+2 more)

### Community 33 - "followUps.ts"
Cohesion: 0.43
Nodes (6): AskSource, followUps(), hits(), key(), matches(), Support chat follow-up questions

### Community 42 - "Life.tsx"
Cohesion: 0.15
Nodes (17): View, palette, BEAM, build(), COLOURS, dirIndex(), DIRS, fleet() (+9 more)

### Community 43 - "framer-motion"
Cohesion: 0.29
Nodes (8): framer-motion, HorizontalScroll(), Props, PhotoPanel(), Props, Disciplines(), Schools(), Discover()

### Community 44 - "Hero.tsx"
Cohesion: 0.22
Nodes (9): explored, listeners, subscribe(), useExplored(), ease, ExploredCard(), Hero(), Line() (+1 more)

### Community 45 - "retrieval.py"
Cohesion: 0.30
Nodes (8): _cosine_similarity(), _normalized_content(), _official_url_clause(), _related_categories(), retrieve_chunks(), retrieve_evidence(), _year_variants(), test_academics_and_admissions_search_together_but_not_campus()

### Community 46 - "pen.ts"
Cohesion: 0.27
Nodes (9): V3, busTerminus(), field(), lake(), pool(), col(), dusk(), hex() (+1 more)

### Community 47 - "Toast.tsx"
Cohesion: 0.33
Nodes (8): emit(), Item, items, listeners, One(), subscribe(), toast(), Toaster()

### Community 48 - "indexer.py"
Cohesion: 0.33
Nodes (4): utc_now(), chunk_text(), test_chunker_keeps_heading_and_table_rows_together(), test_chunker_preserves_overlapping_context()

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Section`, `package.json`, `CampusPulse.tsx`, `Programmes.tsx`, `Life.tsx`, `framer-motion`, `AskProvider.tsx`, `Hero.tsx`, `Toast.tsx`, `emergency.ts`, `Header.tsx`, `App.tsx`, `AskAnswer.tsx`, `useAsk`, `ChatWidget.tsx`, `Photo`, `CampusMap.tsx`, `Home.tsx`?**
  _High betweenness centrality (0.247) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `Document` (e.g. with `refresh_indexed_sources()` and `admin_stats()`) actually correct?**
  _`Document` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Should `scene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10570824524312897 - nodes in this community are weakly interconnected._
- **Why does `playwright` connect `verify.mjs` to `package.json`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `DocumentChunk` (e.g. with `admin_stats()` and `list_documents()`) actually correct?**
  _`DocumentChunk` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05603864734299517 - nodes in this community are weakly interconnected._
- **Why does `followUps()` connect `followUps.ts` to `AskAnswer.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._