# Execution Plan: Add Visual Diagrams to Study Modules

**Created**: 2026-03-02
**Last Updated**: 2026-03-03
**Status**: Complete

## Overview

Add ~35 Mermaid.js diagrams across all 7 study modules to make complex concepts visually intuitive. Diagrams are rendered at build time via `rehype-mermaid` — they live as text code blocks in MDX files, producing inline SVGs with zero client-side JavaScript.

## Architecture Reference

See `ARCHITECTURE.md` → Decision Log → "2026-03-02: Add Visual Diagrams to Study Modules (Mermaid.js)"

---

## Phases

### Phase 1: Infrastructure Setup
**Status**: ⬜ Not Started
**Prerequisites**: None
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 1.1**: Install `rehype-mermaid` and its peer dependency
  - **Files**: `package.json`
  - **Details**: Run `npm install rehype-mermaid`. This package uses Playwright's Chromium under the hood to render Mermaid diagrams to SVG at build time. Check if any peer dependencies (like `playwright` or `mermaid`) need to be installed separately.
  - **Success Criteria**: Package installed, no dependency errors

- [ ] **Task 1.2**: Configure `rehype-mermaid` in Astro config
  - **Files**: `astro.config.mjs`
  - **Details**: Import `rehypeMermaid` and add it to Starlight's `customMarkdown.rehypePlugins` (or Astro's `markdown.rehypePlugins` depending on Starlight version). Use `strategy: 'img-svg'` or `'inline-svg'` for static rendering. Test which strategy works best with Starlight's layout.
  - **Success Criteria**: Mermaid code blocks in MDX render as SVG diagrams

- [ ] **Task 1.3**: Add a test diagram to Module 1 and verify rendering
  - **Files**: `src/content/docs/module-1-pipelines-and-observability/index.mdx`
  - **Details**: Add a simple Mermaid flowchart code block after the "About This Module" section. Run `npm run dev` and verify the diagram renders. Then run `npm run build` and verify it works in production build too.
  - **Success Criteria**: Diagram renders in both dev and production builds

#### Checkpoint
- [ ] `rehype-mermaid` installed and configured
- [ ] Test diagram renders in dev mode (`npm run dev`)
- [ ] Test diagram renders in production build (`npm run build`)
- [ ] Ready to add diagrams to all modules

---

### Phase 2: Module 1 — Data Pipelines & Observability (5 diagrams)
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 2.1**: ETL vs ELT Pipeline Flow diagram
  - **Files**: `src/content/docs/module-1-pipelines-and-observability/index.mdx`
  - **Details**: Add after the ETL vs ELT explanation in Section 1. Flowchart LR showing two parallel paths:
    - ETL: Sources → Extract → Transform (staging) → Load → Warehouse
    - ELT: Sources → Extract → Load → Warehouse → Transform (in-place)
  - **Success Criteria**: Both paths clearly visible, labels explain the difference

- [ ] **Task 2.2**: Batch vs Streaming Pipeline diagram
  - **Files**: `src/content/docs/module-1-pipelines-and-observability/index.mdx`
  - **Details**: Add after the batch vs streaming explanation in Section 1. Flowchart LR:
    - Batch: Data accumulates → Scheduled trigger → Process batch → Output
    - Streaming: Events arrive → Process immediately → Output continuously
  - **Success Criteria**: Timing difference is visually obvious

- [ ] **Task 2.3**: 5 Pillars of Data Observability diagram
  - **Files**: `src/content/docs/module-1-pipelines-and-observability/index.mdx`
  - **Details**: Add at the start of Section 2. Mindmap with "Data Observability" at center, branching to 5 pillars: Freshness (Is it up to date?), Volume (Is the right amount arriving?), Distribution (Are values in expected range?), Schema (Has the structure changed?), Lineage (Where did it come from/go?).
  - **Success Criteria**: All 5 pillars visible with one-line descriptions

- [ ] **Task 2.4**: SLA/SLO/SLI Hierarchy diagram
  - **Files**: `src/content/docs/module-1-pipelines-and-observability/index.mdx`
  - **Details**: Add in Section 3 after the SLA/SLO/SLI explanation. Flowchart TB:
    - SLA (Business Promise: "99.9% data freshness") → SLO (Internal Target: "Data updated within 15 min") → SLI (Measured Metric: "Actual update latency = 12 min")
  - **Success Criteria**: Hierarchy from business to technical is clear

- [ ] **Task 2.5**: Data Observability vs Software Observability diagram
  - **Files**: `src/content/docs/module-1-pipelines-and-observability/index.mdx`
  - **Details**: Add in Section 4. Side-by-side flowchart:
    - Software Observability: Metrics, Logs, Traces
    - Data Observability: Freshness, Volume, Distribution, Schema, Lineage
    - Highlight shared concept: "Both detect silent failures before users notice"
  - **Success Criteria**: Parallel structure makes the comparison intuitive

#### Checkpoint
- [ ] All 5 diagrams render correctly in Module 1
- [ ] Diagrams are placed contextually (near the text they illustrate)
- [ ] `npm run build` succeeds

---

### Phase 3: Module 2 — Industry Landscape (4 diagrams)
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 3.1**: Snowflake Architecture diagram
  - **Files**: `src/content/docs/module-2-industry-landscape/index.mdx`
  - **Details**: Add in Section 1. Flowchart TB showing Snowflake's three-layer architecture:
    - Cloud Services (query optimization, security, metadata)
    - Compute Layer (independent Virtual Warehouses — can scale independently)
    - Storage Layer (micro-partitions, columnar, compressed)
    - Key callout: Compute and Storage scale independently
  - **Success Criteria**: Three layers clearly separated with independence highlighted

- [ ] **Task 3.2**: Databricks Lakehouse Architecture diagram
  - **Files**: `src/content/docs/module-2-industry-landscape/index.mdx`
  - **Details**: Add in Section 2. Flowchart TB:
    - Raw Data (Data Lake) → Delta Lake (ACID, versioning) → Unity Catalog (governance, lineage) → Analytics & ML workloads
    - Key callout: Lakehouse = combines data lake flexibility with warehouse reliability
  - **Success Criteria**: Progression from raw to governed is clear

- [ ] **Task 3.3**: Observability Tools Ecosystem Map
  - **Files**: `src/content/docs/module-2-industry-landscape/index.mdx`
  - **Details**: Add in Section 3. Mindmap showing categories:
    - Data Quality Testing: Great Expectations, Soda, dbt tests
    - Data Observability Platforms: Monte Carlo, Bigeye, Datafold
    - Pipeline Orchestration (with monitoring): Airflow, Dagster, Prefect
    - Standards: OpenTelemetry for data
  - **Success Criteria**: Tool landscape organized by category

- [ ] **Task 3.4**: Lessons for Google mindmap
  - **Files**: `src/content/docs/module-2-industry-landscape/index.mdx`
  - **Details**: Add in Section 4. Mindmap:
    - Lessons for Google → Governance-first design, Multi-signal observability, Developer-friendly checks, Unified data+software observability, AI-powered anomaly detection
  - **Success Criteria**: Five key takeaways visible at a glance

#### Checkpoint
- [ ] All 4 diagrams render correctly in Module 2
- [ ] `npm run build` succeeds

---

### Phase 4: Module 3 — Google's Data Ecosystem (4 diagrams)
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 4.1**: Google Foundational Papers Timeline
  - **Files**: `src/content/docs/module-3-google-ecosystem/index.mdx`
  - **Details**: Add in Section 1. Mermaid timeline diagram:
    - 2003: GFS (→ HDFS)
    - 2004: MapReduce (→ Hadoop)
    - 2006: Bigtable (→ HBase)
    - 2010: Dremel (→ Apache Drill, Presto)
    - 2012: Spanner (→ CockroachDB)
    - Show Google paper → open-source counterpart
  - **Success Criteria**: Chronological progression with industry impact visible

- [ ] **Task 4.2**: BigQuery Architecture diagram
  - **Files**: `src/content/docs/module-3-google-ecosystem/index.mdx`
  - **Details**: Add in Section 2. Flowchart TB:
    - User Query → Dremel (distributed execution engine) → Colossus (distributed file system) → Jupiter (petabit network)
    - Callout: Serverless — no clusters to provision
  - **Success Criteria**: Three-component stack is clear

- [ ] **Task 4.3**: Google Engineering Culture Pillars
  - **Files**: `src/content/docs/module-3-google-ecosystem/index.mdx`
  - **Details**: Add in Section 3. Mindmap:
    - Google Engineering Culture → Code Review (every change reviewed), Monorepo (one codebase), SRE Philosophy (reliability as feature), Design Docs (think before code), Bottom-up Innovation (20% time)
  - **Success Criteria**: Five cultural pillars visible with brief descriptions

- [ ] **Task 4.4**: Google Maps Data Ingestion Pipeline
  - **Files**: `src/content/docs/module-3-google-ecosystem/index.mdx`
  - **Details**: Add in Section 4. Flowchart LR:
    - Sources: Satellite Imagery, Street View Cars, User Reports, Traffic Sensors, Business Listings
    - → Ingestion → Processing & Fusion → Verification (automated + human) → Serving (Maps app)
  - **Success Criteria**: Multi-source to single-product flow is clear

#### Checkpoint
- [ ] All 4 diagrams render correctly in Module 3
- [ ] `npm run build` succeeds

---

### Phase 5: Module 4 — ML/AI Infrastructure (6 diagrams)
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1
**Estimated Scope**: Large

#### Tasks
- [ ] **Task 5.1**: ML Researcher's Journey diagram
  - **Files**: `src/content/docs/module-4-ml-ai-infrastructure/index.mdx`
  - **Details**: Add in Section 1. Flowchart LR:
    - Problem Framing → Data Exploration → Feature Engineering → Experimentation → Evaluation → Productionization
    - Annotate first 3 stages: "~80% of time spent here"
    - Annotate last stage: "~20% but where value is delivered"
  - **Success Criteria**: The 80/20 split is visually highlighted

- [ ] **Task 5.2**: Data Collection & Labeling Approaches
  - **Files**: `src/content/docs/module-4-ml-ai-infrastructure/index.mdx`
  - **Details**: Add in Section 2. Mindmap:
    - Training Data Sources → Human Annotation (high quality, expensive), Crowd-sourcing (scale, variable quality), Semi-supervised (leverage unlabeled data), Active Learning (smart sampling), Synthetic Data (generated, unlimited scale)
  - **Success Criteria**: Five approaches with key trade-off visible

- [ ] **Task 5.3**: Training-Serving Skew diagram
  - **Files**: `src/content/docs/module-4-ml-ai-infrastructure/index.mdx`
  - **Details**: Add in Section 3. Flowchart TB showing two parallel pipelines:
    - Training: Raw Data → Feature Computation A → Model Training
    - Serving: Live Data → Feature Computation B → Model Inference
    - Red highlight on the gap between Feature Computation A and B: "SKEW: These must match!"
  - **Success Criteria**: The dangerous gap between training and serving is visually obvious

- [ ] **Task 5.4**: Feature Store Architecture
  - **Files**: `src/content/docs/module-4-ml-ai-infrastructure/index.mdx`
  - **Details**: Add in Section 3 (near feature store discussion). Flowchart TB:
    - Raw Data → Feature Pipelines → Feature Store (splits to: Online Store for low-latency serving, Offline Store for batch training) → both feed into Training Pipeline and Serving Pipeline
  - **Success Criteria**: Feature Store as the bridge between training and serving is clear

- [ ] **Task 5.5**: GPU vs TPU Decision Flow
  - **Files**: `src/content/docs/module-4-ml-ai-infrastructure/index.mdx`
  - **Details**: Add in Section 4. Flowchart TD decision tree:
    - Large Language Model? → Yes: TPU (optimized for Google's frameworks)
    - Need multi-framework flexibility? → Yes: GPU (CUDA ecosystem)
    - Google Cloud ecosystem? → Yes: TPU (native integration)
    - Need multi-cloud? → Yes: GPU (universal support)
  - **Success Criteria**: Decision tree is easy to follow

- [ ] **Task 5.6**: Model Lifecycle diagram
  - **Files**: `src/content/docs/module-4-ml-ai-infrastructure/index.mdx`
  - **Details**: Add in Section 5. Flowchart LR showing a cycle:
    - Train → Validate → Deploy → Monitor → Detect Drift → Retrain (loops back)
    - Branch from Detect Drift: Data Drift, Concept Drift, Feature Drift
  - **Success Criteria**: Lifecycle loop and drift types are visible

#### Checkpoint
- [ ] All 6 diagrams render correctly in Module 4
- [ ] `npm run build` succeeds

---

### Phase 6: Module 5 — AI-First Product Strategy (4 diagrams)
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 6.1**: AI-First Spectrum diagram
  - **Files**: `src/content/docs/module-5-ai-first-strategy/index.mdx`
  - **Details**: Add in Section 1. Flowchart LR progression:
    - Traditional Product → +AI Feature (bolt-on) → AI-Enhanced (AI improves core) → AI-First (designed around AI) → AI-Native (impossible without AI)
    - Examples at each level
  - **Success Criteria**: Progression from traditional to AI-native is clear

- [ ] **Task 6.2**: LLM Interface Patterns mindmap
  - **Files**: `src/content/docs/module-5-ai-first-strategy/index.mdx`
  - **Details**: Add in Section 2. Mindmap:
    - LLM Interface Patterns → Natural Language Query (NL2X), Conversational Investigation, Proactive Insights, Contextual Assistance, AI-Generated Summaries
  - **Success Criteria**: Five distinct patterns visible

- [ ] **Task 6.3**: Accuracy-Trust-UX Triangle
  - **Files**: `src/content/docs/module-5-ai-first-strategy/index.mdx`
  - **Details**: Add in Section 4. Flowchart showing triangle relationship:
    - Three nodes: Accuracy, Trust, UX — all connected
    - Center: Successful AI Product
    - Failure modes: Low Accuracy = "cool demo trap", Low Trust = "trust erosion", Low UX = "accuracy theater"
  - **Success Criteria**: Triangle with failure modes is intuitive

- [ ] **Task 6.4**: AI Product Maturity Ladder
  - **Files**: `src/content/docs/module-5-ai-first-strategy/index.mdx`
  - **Details**: Add in Section 5. Flowchart TB (bottom to top):
    - Level 1: Rules-based (if/then logic)
    - Level 2: ML-enhanced (trained models)
    - Level 3: LLM-powered (language models)
    - Level 4: AI-native (AI is the product)
  - **Success Criteria**: Ladder progression with examples at each level

#### Checkpoint
- [ ] All 4 diagrams render correctly in Module 5
- [ ] `npm run build` succeeds

---

### Phase 7: Module 6 — AI + Data Observability (4 diagrams)
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 7.1**: Text-to-SQL Pipeline diagram
  - **Files**: `src/content/docs/module-6-ai-observability/index.mdx`
  - **Details**: Add in Section 1. Flowchart LR:
    - User Question (natural language) → LLM (+ schema context) → SQL Query → Database Execution → Results → Natural Language Answer
  - **Success Criteria**: End-to-end NL2SQL flow is clear

- [ ] **Task 7.2**: ML Anomaly Detection Pipeline
  - **Files**: `src/content/docs/module-6-ai-observability/index.mdx`
  - **Details**: Add in Section 2. Flowchart LR:
    - Pipeline Metrics → Feature Extraction → ML Model (Isolation Forest / Autoencoder / Prophet) → Anomaly Score → Decision: Alert or Suppress
    - Feedback loop: Human feedback → Model retraining
  - **Success Criteria**: Detection pipeline with feedback loop visible

- [ ] **Task 7.3**: AI Copilot Interaction sequence diagram
  - **Files**: `src/content/docs/module-6-ai-observability/index.mdx`
  - **Details**: Add in Section 3. Mermaid sequence diagram:
    - Developer → Copilot: "Pipeline X failed at 3am"
    - Copilot → Logs/Metrics/Lineage: Gather context
    - Copilot → Developer: "Root cause: upstream schema change. Suggested fix: update parser."
  - **Success Criteria**: Interaction pattern between developer and copilot is clear

- [ ] **Task 7.4**: Auto-Documentation & Lineage Flow
  - **Files**: `src/content/docs/module-6-ai-observability/index.mdx`
  - **Details**: Add in Section 4. Flowchart LR:
    - Source Tables + Query Logs + Code → AI Analysis → Generated: Column Descriptions, Usage Docs, Lineage Graph → Data Catalog
  - **Success Criteria**: Automation loop replacing manual docs is clear

#### Checkpoint
- [ ] All 4 diagrams render correctly in Module 6
- [ ] `npm run build` succeeds

---

### Phase 8: Module 7 — Developer Experience (4 diagrams)
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 8.1**: Three Dimensions of DevEx diagram
  - **Files**: `src/content/docs/module-7-developer-experience/index.mdx`
  - **Details**: Add in Section 1. Mindmap:
    - Developer Experience → Feedback Loops (build time, test speed, deploy frequency), Cognitive Load (API complexity, docs quality, error clarity), Flow State (interruptions, context switching, tool friction)
  - **Success Criteria**: Three dimensions with concrete metrics

- [ ] **Task 8.2**: IDE Integration Architecture
  - **Files**: `src/content/docs/module-7-developer-experience/index.mdx`
  - **Details**: Add in Section 2. Flowchart TB:
    - IDE (VS Code / JetBrains) → Extension/Plugin (inline health, hover info, quick actions) → API Layer (REST/gRPC) → Observability Platform (metrics, alerts, lineage)
  - **Success Criteria**: Connection from IDE to platform is clear

- [ ] **Task 8.3**: Shift-Left Observability in CI/CD
  - **Files**: `src/content/docs/module-7-developer-experience/index.mdx`
  - **Details**: Add in Section 3. Flowchart LR:
    - Code → Pre-commit Hooks (data quality checks) → PR Review (schema validation) → CI Pipeline (integration tests) → Deploy → Post-deploy Monitoring
    - Arrow annotation: "← Shift Left: Catch issues earlier"
  - **Success Criteria**: "Shift left" concept is visually concrete

- [ ] **Task 8.4**: Developer Tool Adoption Funnel
  - **Files**: `src/content/docs/module-7-developer-experience/index.mdx`
  - **Details**: Add in Section 4. Flowchart TB:
    - Awareness (docs, talks, demos) → Trial (easy setup, quick wins) → Integration (fits existing workflow) → Habit (daily use, muscle memory) → Advocacy (recommends to others)
  - **Success Criteria**: Funnel with strategies at each stage

#### Checkpoint
- [ ] All 4 diagrams render correctly in Module 7
- [ ] `npm run build` succeeds

---

### Phase 9: Polish & Production Verification
**Status**: ⬜ Not Started
**Prerequisites**: Phases 2-8
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 9.1**: Full production build test
  - **Details**: Run `npm run build` and verify all ~35 diagrams render. Check for any Mermaid syntax errors in the build output. Fix any issues found.
  - **Success Criteria**: Clean build with zero Mermaid errors

- [ ] **Task 9.2**: Visual review of all diagrams
  - **Details**: Run `npm run preview` and navigate through all 7 modules. Verify each diagram:
    - Is readable (text isn't cut off or overlapping)
    - Is placed near the relevant text
    - Has appropriate caption/context in surrounding MDX
  - **Success Criteria**: All diagrams are legible and well-placed

- [ ] **Task 9.3**: Update ForRajdeep.md
  - **Files**: `ForRajdeep.md`
  - **Details**: Add a section explaining the visual diagrams feature — what was added, the Mermaid.js approach, and how to edit/add diagrams in the future.
  - **Success Criteria**: ForRajdeep.md covers the diagrams feature

#### Checkpoint
- [ ] Production build succeeds
- [ ] All diagrams visually verified
- [ ] ForRajdeep.md updated
- [ ] Ready to deploy

---

## Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| `rehype-mermaid` incompatible with Starlight 0.37.6 | Low | High | Test in Phase 1 before adding all diagrams. Fallback: use `astro-mermaid` or client-side rendering |
| Mermaid mindmap/timeline types not supported by rehype-mermaid | Low | Med | Test these diagram types in Phase 1. Fallback: use flowcharts instead |
| Build time significantly increases | Med | Low | Mermaid rendering adds seconds, not minutes. Acceptable trade-off |
| Diagrams look bad in dark mode | Med | Low | Nice-to-have; can address later with Mermaid theme config |
| Playwright/Chromium dependency causes CI issues | Low | Med | GitHub Actions runners have Chromium. If needed, use `strategy: 'pre-mermaid'` |

## Open Questions

None — approach is well-defined from the brainstorm session.

## Notes & Decisions

- **2026-03-02**: Plan created from ARCHITECTURE.md visual diagrams decision log. 9 phases: 1 setup + 7 modules + 1 polish. ~35 total diagrams.
