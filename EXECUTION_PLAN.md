# Execution Plan: PM Onboarding Study Plan Website

**Created**: 2026-02-11
**Last Updated**: 2026-02-11
**Status**: Not Started

## Overview
Build a static study plan website with 6 modules (~12 hours of content) using Astro + Starlight, deployed on GitHub Pages. Every piece of content must be backed by real, cited resources. The site serves as a reusable onboarding tool for PMs joining Google's Core Data team.

## Architecture Reference
See [ARCHITECTURE.md](ARCHITECTURE.md) for full design details.

---

## Phases

### Phase 1: Project Scaffolding
**Status**: Not Started
**Prerequisites**: None
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 1.1**: Initialize Astro + Starlight project
  - **Details**: Run `npm create astro@latest` with Starlight template in the repo root. Configure `astro.config.mjs` with site title ("PM Onboarding: Core Data Observability"), sidebar navigation for 6 modules + glossary, and hub-and-spoke layout.
  - **Files**: `astro.config.mjs`, `package.json`, `tsconfig.json`
  - **Success Criteria**: `npm run dev` starts local server without errors

- [ ] **Task 1.2**: Configure GitHub Pages deployment
  - **Details**: Add GitHub Actions workflow (`.github/workflows/deploy.yml`) to auto-build and deploy on push to main. Set Astro `site` and `base` config for GitHub Pages URL.
  - **Files**: `.github/workflows/deploy.yml`, `astro.config.mjs`
  - **Success Criteria**: Workflow file exists and astro config has correct site/base

- [ ] **Task 1.3**: Create folder structure and placeholder pages
  - **Details**: Create placeholder MDX files for all 6 modules + glossary + dashboard matching the ARCHITECTURE.md file structure. Each gets frontmatter with title and description.
  - **Files**: `src/content/docs/index.mdx`, `src/content/docs/module-1-pipelines-and-observability/index.mdx`, `src/content/docs/module-2-industry-landscape/index.mdx`, `src/content/docs/module-3-google-ecosystem/index.mdx`, `src/content/docs/module-4-ai-first-strategy/index.mdx`, `src/content/docs/module-5-ai-observability/index.mdx`, `src/content/docs/module-6-developer-experience/index.mdx`, `src/content/docs/glossary/index.mdx`
  - **Success Criteria**: All placeholder files exist, site builds, sidebar shows all modules

#### Checkpoint
- [ ] `npm run dev` serves the site locally
- [ ] Sidebar navigation lists all 6 modules + glossary
- [ ] GitHub Actions workflow file exists
- [ ] Ready to proceed to Phase 2

---

### Phase 2: Dashboard Home Page
**Status**: Not Started
**Prerequisites**: Phase 1 complete
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 2.1**: Build the hub-and-spoke dashboard
  - **Details**: Design `index.mdx` home page with a welcome section, card grid linking to all 6 modules (each card shows module number, title, estimated study time, one-line description), a "How to use this site" section, and glossary link. Use Starlight's built-in `Card` and `CardGrid` components.
  - **Files**: `src/content/docs/index.mdx`
  - **Success Criteria**: Home page shows all 6 module cards with correct links, renders on desktop and mobile

#### Checkpoint
- [ ] Dashboard shows all 6 module cards with correct links
- [ ] Site builds without errors
- [ ] Ready to proceed to Phase 3

---

### Phase 3: Module Content — Research & Write
**Status**: Not Started
**Prerequisites**: Phase 2 complete
**Estimated Scope**: Large (bulk of the work)

> **Approach**: Each task involves (a) researching real, verifiable resources via web search, and (b) writing MDX content with cited summaries, key takeaways, and "Reflect & Apply" prompts. Every claim needs a citation. 3-5 resources per section.

#### Tasks

- [ ] **Task 3.1**: Write Module 1 — Data Pipelines & Observability Foundations (2.5 hrs)
  - **Files**: `src/content/docs/module-1-pipelines-and-observability/index.mdx`
  - **Sections**:
    1. What are data pipelines — ETL vs ELT, batch vs streaming (30 min)
    2. The 5 pillars of data observability (45 min)
    3. Data quality fundamentals and SLAs/SLIs/SLOs for data (30 min)
    4. Data observability vs software observability (15 min)
    5. Key technologies: Apache Beam, Spark, Kafka, Dataflow (30 min)
  - **Known resources to cite**:
    - [What Is Data Observability? 5 Key Pillars — Monte Carlo](https://www.montecarlodata.com/blog-what-is-data-observability/)
    - [5 Pillars of Data Observability — Barr Moses, Medium](https://medium.com/data-science/introducing-the-five-pillars-of-data-observability-e73734b263d5)
    - [Data Observability — Airbyte](https://airbyte.com/data-engineering-resources/data-observability)
    - [5 Key Pillars of Data Observability 2026 — Modern Data 101](https://medium.com/@community_md101/5-key-pillars-of-data-observability-to-know-in-2026-814515c22a04)
    - [5 Crucial Pillars — RisingWave](https://risingwave.com/blog/5-crucial-pillars-of-data-observability-for-modern-data-management/)
    - Book: [Fundamentals of Data Observability — O'Reilly](https://www.oreilly.com/library/view/fundamentals-of-data/9781098133283/)
    - Book: [Data Observability for Data Engineering — O'Reilly](https://www.oreilly.com/library/view/data-observability-for/9781804616024/)
    - Research additional resources for ETL/ELT, batch/streaming, and key technologies
  - **Success Criteria**: All 5 sections with cited summaries, Key Takeaways, Reflect & Apply

- [ ] **Task 3.2**: Write Module 2 — Industry Landscape: Snowflake & Databricks (2 hrs)
  - **Files**: `src/content/docs/module-2-industry-landscape/index.mdx`
  - **Sections**:
    1. Snowflake architecture and observability features (30 min)
    2. Databricks Lakehouse architecture and observability (30 min)
    3. Observability tools ecosystem: Monte Carlo, Great Expectations, Soda, dbt (30 min)
    4. Patterns and lessons for Google's internal platform (30 min)
  - **Known resources to cite**:
    - [Snowflake Acquires Observe — Snowflake Press Release](https://www.snowflake.com/en/news/press-releases/snowflake-announces-intent-to-acquire-observe-to-deliver-ai-powered-observability-at-enterprise-scale/)
    - [Snowflake + Observe — TechTarget](https://www.techtarget.com/searchdatamanagement/news/366637059/Snowflake-storms-into-IT-monitoring-with-Observe-acquisition)
    - [5 Reasons Snowflake Acquiring Observe Sets Tone for 2026 — Futurum](https://futurumgroup.com/insights/5-reasons-snowflake-acquiring-observe-sets-the-tone-for-2026/)
    - [5 Top Snowflake Observability Tools 2026 — ChaosGenius](https://www.chaosgenius.io/blog/snowflake-observability-tools/)
    - [What's New Databricks Unity Catalog — Databricks Blog](https://www.databricks.com/blog/whats-new-databricks-unity-catalog-data-ai-summit-2025)
    - [Lakehouse Monitoring — Databricks](https://www.databricks.com/product/machine-learning/lakehouse-monitoring)
    - [Databricks Data Governance AI-Native — DZone](https://dzone.com/articles/unity-catalog-ai-databricks-data-governance)
    - [Databricks Lakehouse Monitoring — Microsoft Learn](https://learn.microsoft.com/en-us/azure/databricks/lakehouse-monitoring/)
    - [Monte Carlo Architecture — Docs](https://docs.getmontecarlo.com/docs/architecture)
    - [Top 14 Data Observability Tools 2026 — Atlan](https://atlan.com/know/data-observability-tools/)
    - [Top 7 Data Observability Tools 2026 — Integrate.io](https://www.integrate.io/blog/top-data-observability-tools/)
    - [Open-Source Data Quality Landscape 2026 — DataKitchen](https://datakitchen.io/the-2026-open-source-data-quality-and-data-observability-landscape/)
    - [OpenTelemetry Official Site](https://opentelemetry.io/)
    - [OpenTelemetry for Data Pipelines — BIX Tech](https://bix-tech.com/distributed-observability-for-data-pipelines-with-opentelemetry-a-practical-endtoend-playbook-for-2026/)
  - **Success Criteria**: All 4 sections with cited summaries, Key Takeaways, Reflect & Apply

- [ ] **Task 3.3**: Write Module 3 — Google's Data Ecosystem (2.5 hrs)
  - **Files**: `src/content/docs/module-3-google-ecosystem/index.mdx`
  - **Sections**:
    1. Foundational papers: MapReduce, Bigtable, Spanner, Borg (60 min)
    2. BigQuery architecture and how it serves data teams (30 min)
    3. Google's engineering culture and how SWEs/data engineers work (30 min)
    4. Google Maps and Gemini data context — publicly known aspects (30 min)
  - **Known resources to cite**:
    - Paper: [MapReduce (2004) — Google Research](http://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf)
    - Paper: [Google File System (2003) — Google Research](http://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf)
    - Paper: [Bigtable (2006) — Google Research](https://research.google.com/archive/bigtable-osdi06.pdf)
    - Paper: [Spanner (2012) — Google Research](https://research.google.com/archive/spanner-osdi2012.pdf)
    - Paper: [Dremel — Google Research](https://storage.googleapis.com/gweb-research2023-media/pubtools/5750.pdf)
    - [FlumeJava — Google Research](https://research.google/pubs/flumejava-easy-efficient-data-parallel-pipelines/)
    - [Colossus — Google Cloud Blog](https://cloud.google.com/blog/products/storage-data-transfer/a-peek-behind-colossus-googles-file-system)
    - [BigQuery Under the Hood — Google Cloud Blog](https://cloud.google.com/blog/products/bigquery/bigquery-under-the-hood)
    - [Cider IDE at Google — Medium](https://medium.com/@bhagyarana80/cider-what-ide-stack-does-google-use-internally-vs-code-intellij-or-something-else-0d67f9e2481d)
    - [Critique: Google's Code Review Tool — SWE Book Ch. 19](https://abseil.io/resources/swe-book/html/ch19.html)
    - [Google's Internal Tools — Medium](https://medium.com/javarevisited/the-tools-i-immediately-had-to-learn-to-write-my-first-line-of-code-at-google-piper-citc-and-ae5a042ee90c)
    - Book: [Software Engineering at Google — free online](https://abseil.io/resources/swe-book)
    - [Gemini Training Data Composition — ScaleByTech](https://scalebytech.com/google-gemini-ai-training-dataset-composition)
    - [Google Maps Platform Features — Master Concept](https://masterconcept.ai/blog/google-cloud-next-2025-in-depth-analysis-of-4-new-google-maps-platform-features-and-potential-industry-applications/)
    - [TFX with Apache Beam — TensorFlow Blog](https://blog.tensorflow.org/2020/03/tensorflow-extended-tfx-using-apache-beam-large-scale-data-processing.html)
  - **Success Criteria**: All 4 sections with cited summaries (papers get PM-friendly summaries), Key Takeaways, Reflect & Apply

- [ ] **Task 3.4**: Write Module 4 — AI-First Product Strategy (2 hrs)
  - **Files**: `src/content/docs/module-4-ai-first-strategy/index.mdx`
  - **Sections**:
    1. What "AI-first" means for product development (20 min)
    2. LLM-powered interfaces and UX patterns (30 min)
    3. Copilot design patterns: GitHub Copilot, Duet AI, Cursor (30 min)
    4. Evaluating AI features: accuracy, trust, UX (20 min)
    5. AI product management frameworks (20 min)
  - **Known resources to cite**:
    - [What We Learned Building AI Products 2025 — Amplitude](https://amplitude.com/blog/ai-product-learnings-2025)
    - [Signals for 2026 — O'Reilly Radar](https://www.oreilly.com/radar/signals-for-2026/)
    - [LLM Product Development Guide — Orq.ai](https://orq.ai/blog/llm-product-development)
    - [State of LLMs 2025 — Sebastian Raschka](https://magazine.sebastianraschka.com/p/state-of-llms-2025)
    - [AI observability tools buyer's guide 2026 — Braintrust](https://www.braintrust.dev/articles/best-ai-observability-tools-2026)
    - Research additional resources for copilot patterns, AI evaluation frameworks
  - **Success Criteria**: All 5 sections with cited summaries, Key Takeaways, Reflect & Apply

- [ ] **Task 3.5**: Write Module 5 — AI + Data Observability (1.5 hrs)
  - **Files**: `src/content/docs/module-5-ai-observability/index.mdx`
  - **Sections**:
    1. Natural language querying and Text-to-SQL for data systems (30 min)
    2. ML-powered anomaly detection for pipeline health (20 min)
    3. AI copilots for developers and data engineers (20 min)
    4. Auto-generated data documentation and lineage (20 min)
  - **Known resources to cite**:
    - [Agentic AI in Observability — DevOps.com](https://devops.com/agentic-ai-in-observability-platforms-empowering-autonomous-sre/)
    - [AWS DevOps Agent — InfoQ](https://www.infoq.com/news/2025/12/aws-devops-agents/)
    - [AI Transforming Observability 2026 — Xurrent](https://www.xurrent.com/blog/ai-incident-management-observability-trends)
    - [Datadog LLM Observability — Datadog](https://www.datadoghq.com/about/latest-news/press-releases/datadog-expands-llm-observability-with-new-capabilities-to-monitor-agentic-ai-accelerate-development-and-improve-model-performance/)
    - [AIOps in the Era of LLMs — ACM](https://dl.acm.org/doi/10.1145/3746635)
    - [Gemini + Database Understanding — Google Cloud Blog](https://cloud.google.com/blog/products/databases/how-to-get-gemini-to-deeply-understand-your-database)
    - [Revolutionizing Incident Management with Agentic AI — IBM](https://www.ibm.com/new/product-blog/revolutionizing-incident-management-with-agentic-ai)
    - Research additional resources for Text-to-SQL, auto-documentation
  - **Success Criteria**: All 4 sections with cited summaries, Key Takeaways, Reflect & Apply

- [ ] **Task 3.6**: Write Module 6 — Developer Experience & IDE Integration (1.5 hrs)
  - **Files**: `src/content/docs/module-6-developer-experience/index.mdx`
  - **Sections**:
    1. Developer experience (DevEx) principles and research (20 min)
    2. IDE integration patterns: VS Code extensions, JetBrains plugins (30 min)
    3. CLI tools and CI/CD integration for observability (20 min)
    4. How developer tools companies embed in workflows (20 min)
  - **Known resources to cite**:
    - [Datadog VS Code Extension — Datadog Docs](https://docs.datadoghq.com/developers/ide_plugins/vscode/)
    - [Datadog IDE Plugins — Datadog Docs](https://docs.datadoghq.com/developers/ide_integrations/)
    - [Datadog for JetBrains — Datadog Docs](https://docs.datadoghq.com/developers/ide_plugins/idea/)
    - [Observability 2.0 and Developer Experience — LeadDev](https://leaddev.com/technical-direction/what-observability-2-means-developer-experience)
    - [Shift-Left Observability — DevOps.com](https://devops.com/modular-shift-left-observability-for-modern-devops-pipelines/)
    - [Shift Right + Observability — Dynatrace](https://www.dynatrace.com/news/blog/shift-right-in-software-development-adapting-observability-for-a-seamless-development-experience/)
    - [10 Observability Tools for Platform Engineers 2026 — Platform Engineering](https://platformengineering.org/blog/10-observability-tools-platform-engineers-should-evaluate-in-2026)
    - [Building the Developer Cloud — Scott Kennedy](https://www.scottkennedy.us/developer-cloud.html)
    - [SWE with LLMs in 2025 — Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/software-engineering-with-llms-in-2025)
    - Research additional resources for DevEx research, CLI observability tools
  - **Success Criteria**: All 4 sections with cited summaries, Key Takeaways, Reflect & Apply

- [ ] **Task 3.7**: Write Glossary page
  - **Files**: `src/content/docs/glossary/index.mdx`
  - **Details**: Alphabetized glossary of 25-35 key terms from all 6 modules. Each term gets a concise definition and a link to the module where it's discussed. Terms include: anomaly detection, Apache Beam, batch processing, copilot, data freshness, data lineage, data observability, data pipeline, data quality, Dataflow, DevEx, ETL, ELT, Kafka, Lakehouse, lineage, MTTR, schema drift, shift-left, SLA/SLI/SLO, Spark, streaming, Text-to-SQL, Unity Catalog, etc.
  - **Success Criteria**: 25-35 terms defined, each linking back to the relevant module

#### Checkpoint
- [ ] All 6 modules have full content with citations
- [ ] Glossary has 25-35 defined terms
- [ ] Site builds without errors
- [ ] All internal links work (dashboard cards → module pages, glossary cross-links)
- [ ] Ready to proceed to Phase 4

---

### Phase 4: Polish & Deploy
**Status**: Not Started
**Prerequisites**: Phase 3 complete
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 4.1**: Build verification and link check
  - **Details**: Run `npm run build` and verify no errors. Check all module pages render correctly, navigation works, and built-in Pagefind search returns results.
  - **Success Criteria**: Clean build, all pages accessible, search functional

- [ ] **Task 4.2**: Write ForRajdeep.md
  - **Details**: Per CLAUDE.md — explain the project architecture, codebase structure, tech decisions, lessons learned, bugs encountered, and practical insights. Make it engaging and educational.
  - **Files**: `ForRajdeep.md`
  - **Success Criteria**: Comprehensive, engaging explanation of the project

- [ ] **Task 4.3**: Deploy to GitHub Pages
  - **Details**: Push to main, verify GitHub Actions runs, confirm site is live at the GitHub Pages URL.
  - **Success Criteria**: Site accessible at `https://<username>.github.io/Onboarding/`

#### Checkpoint
- [ ] Site is live on GitHub Pages
- [ ] All 6 modules accessible and searchable
- [ ] ForRajdeep.md complete
- [ ] All success criteria from ARCHITECTURE.md met

---

## Module Summary

| # | Module | Key Question It Answers | Study Time |
|---|--------|------------------------|------------|
| 1 | Data Pipelines & Observability Foundations | What are data pipelines and how do you observe them? | 2.5 hrs |
| 2 | Industry Landscape: Snowflake & Databricks | What do competitors offer and what can we learn? | 2 hrs |
| 3 | Google's Data Ecosystem | What powers Google's data stack and developer culture? | 2.5 hrs |
| 4 | AI-First Product Strategy | How do you think AI-first as a PM? | 2 hrs |
| 5 | AI + Data Observability | Where do AI and observability intersect? | 1.5 hrs |
| 6 | Developer Experience & IDE Integration | How do you meet developers where they are? | 1.5 hrs |
| | **Total** | | **12 hrs** |

---

## Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Resource URLs become dead links | Medium | Medium | Use authoritative/stable sources (official docs, Google Research, major publications). Prefer permalinks. |
| Astro/Starlight version issues | Low | Medium | Pin dependency versions in package.json |
| GitHub Pages deployment issues | Low | Low | Test locally with `npm run build` first. Use standard Astro deploy workflow. |
| Content scope creep per module | Medium | Medium | Strict time budget per section. 3-5 resources max per section. |
| Web search returns outdated resources | Medium | Low | Verify publication dates. Prefer 2023-2026 resources. |
| Google internal info is limited publicly | High | Medium | Focus on published papers, blog posts, public talks. Note where internal knowledge will fill gaps. |

## Open Questions
- [x] All questions resolved during brainstorm phase

## Notes & Decisions
- **2026-02-11**: Plan created from ARCHITECTURE.md (6-module, 12-hour scope). 4 phases, 12 tasks. Phase 3 is the largest (7 tasks: 6 modules + glossary). Resource URLs carried forward from prior research.
