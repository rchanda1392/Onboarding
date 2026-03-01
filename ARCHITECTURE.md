# Architecture: PM Onboarding Study Plan Website

## Problem Statement

A new Product Manager joining Google's Core Data team needs to rapidly onboard on data observability, pipeline monitoring, AI-first product strategy, and the Google internal ecosystem. The team manages pipelines for Google Maps data and Google Gemini pre/post training data, and is building an internal observability platform similar to what Snowflake and Databricks offer externally.

The study plan must be a navigable website with modular content, where every piece of information is backed by a citation to a real resource (article, video, paper, or documentation).

## Requirements

### Must Have
- Hub-and-spoke website with a central dashboard linking to independent modules
- 7 focused study modules covering all critical onboarding topics (~14.5 hours total)
- Every content section backed by citations (articles, videos, papers, docs)
- Resource summaries and/or embedded YouTube videos per section
- Estimated study time per module
- Mobile-responsive design
- Free hosting (GitHub Pages)
- Shareable with future PMs joining the team
- AI-powered Q&A chat sidebar for asking questions about the study content

### Nice to Have
- Search functionality across all modules
- Progress tracking (checkboxes/completion state)
- Dark mode
- Print-friendly module pages
- "Recommended reading order" suggestion on the dashboard
- Glossary page with key data/observability terminology
- "Reflect & Apply" prompts at the end of each module (2-3 questions to internalize material)

### Out of Scope
- Google-internal/confidential content (only publicly available resources)
- Interactive quizzes or assessments
- User authentication or personalized progress persistence
- Backend/database

## Constraints
- **Timeline**: 1-2 weeks to build the site
- **Content**: All content must have verifiable citations — no uncited claims
- **Audience**: Primary user + future PMs (must be polished and clear)
- **Hosting**: Free (GitHub Pages)
- **Maintenance**: Low — content should be easy to update (Markdown/MDX)

## Users
- **Primary**: New PM joining Google Core Data team (strong PM skills, new to data infra)
- **Secondary**: Future PMs onboarding to the same or similar teams

## Solution Overview

A static website built with **Astro + Starlight** deployed on **GitHub Pages**. The site uses a hub-and-spoke navigation model with a central dashboard that links to 7 focused study modules (~14.5 hours total). Each module is a Markdown/MDX page with cited resources, summaries, and embedded media. An AI-powered chat sidebar (Azure OpenAI GPT-5.2) lets users ask questions about the study content in natural language.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  GitHub Pages (Free Static Hosting)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌──────────────────────────────────┐  ┌──────────────────┐    │
│   │       Dashboard (Home Page)       │  │  Chat Sidebar    │    │
│   │                                   │  │  (Azure OpenAI)  │    │
│   │  ┌──────┐ ┌──────┐ ┌──────┐     │  │                  │    │
│   │  │ Mod 1│ │ Mod 2│ │ Mod 3│     │  │  - Q&A on module │    │
│   │  └──────┘ └──────┘ └──────┘     │  │    content       │    │
│   │  ┌──────┐ ┌──────┐ ┌──────┐     │  │  - Streaming     │    │
│   │  │ Mod 4│ │ Mod 5│ │ Mod 6│     │  │    responses     │    │
│   │  └──────┘ └──────┘ └──────┘     │  │  - Markdown      │    │
│   │  ┌──────┐                        │  │    rendering     │    │
│   │  │ Mod 7│  + Glossary page       │  │  - Session       │    │
│   │  └──────┘                        │  │    history       │    │
│   └──────────────────────────────────┘  └──────────────────┘    │
│                                                                   │
│   Built with: Astro + Starlight + Preact                         │
│   Content: Markdown/MDX files                                     │
│   Chat: Vanilla JS sidebar (public/chat-loader.js)               │
│   AI: Azure OpenAI GPT-5.2 (client-side API calls)              │
│   Styling: Starlight defaults + custom CSS                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Chat Feature Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser (Client-Side Only)                      │
│                                                   │
│  ┌─────────────────────────────────────────┐     │
│  │  Chat Sidebar (Vanilla JS)              │     │
│  │  - Fixed right panel (420px)            │     │
│  │  - Message history (last 10)            │     │
│  │  - Markdown rendering (marked.js)       │     │
│  │  - Azure config input (first use)       │     │
│  │  - Or auto-config via chat-config.json  │     │
│  └──────────────┬──────────────────────────┘     │
│                  │                                 │
│  ┌──────────────▼──────────────────────────┐     │
│  │  Content Bundle (built at build time)    │     │
│  │  - All module text as JSON               │     │
│  │  - Generated by scripts/extract-content  │     │
│  └──────────────┬──────────────────────────┘     │
│                  │                                 │
│  ┌──────────────▼──────────────────────────┐     │
│  │  Azure OpenAI API Call (client-side)     │     │
│  │  - Responses API (streaming)             │     │
│  │  - System prompt + full content context  │     │
│  │  - User question + conversation history  │     │
│  └─────────────────────────────────────────┘     │
│                                                   │
│  Config: localStorage (GitHub Pages) or           │
│          chat-config.json (Azure SWA)             │
└─────────────────────────────────────────────────┘
```

## Modules (7 modules, ~14.5 hours total)

### Module 1: Data Pipelines & Observability Foundations
**Depth**: Focused primer (covers the essentials, skips deep theory)
**Estimated Study Time**: 2.5 hours
- What are data pipelines — ETL vs ELT, batch vs streaming (30 min)
- The 5 pillars of data observability: freshness, volume, distribution, schema, lineage (45 min)
- Data quality fundamentals and SLAs/SLIs/SLOs for data (30 min)
- Data observability vs software observability — what's different (15 min)
- Key technologies to know: Apache Beam, Spark, Kafka, Dataflow (30 min)

### Module 2: Industry Landscape — Snowflake & Databricks
**Depth**: Comparative overview (what they do, what to learn from them)
**Estimated Study Time**: 2 hours
- Snowflake architecture and its observability features (Snowsight, Query Profile, Resource Monitors) (30 min)
- Databricks Lakehouse architecture and observability (Lakehouse Monitoring, Unity Catalog) (30 min)
- Observability tools ecosystem: Monte Carlo, Great Expectations, Soda, dbt tests (30 min)
- Patterns and lessons applicable to Google's internal platform (30 min)

### Module 3: Google's Data Ecosystem (Public Knowledge)
**Depth**: Curated essentials (key papers and culture, not exhaustive)
**Estimated Study Time**: 2.5 hours
- The foundational papers: MapReduce, Bigtable, Spanner, Borg (60 min)
- BigQuery architecture and how it serves data teams (30 min)
- Google's engineering culture and how SWEs/data engineers work (30 min)
- Google Maps and Gemini data context (publicly known aspects) (30 min)

### Module 4: ML/AI Infrastructure — From Data to Model
**Depth**: End-to-end journey from raw data to production ML model
**Estimated Study Time**: 2.5 hours
- Data collection, labeling, and preparation for ML (30 min)
- Feature engineering and feature stores (30 min)
- Training infrastructure and experiment tracking (30 min)
- Model serving and inference at scale (30 min)
- ML researcher workflows and day-in-the-life (30 min)

### Module 5: AI-First Product Strategy
**Depth**: Focused on actionable frameworks
**Estimated Study Time**: 2 hours
- What "AI-first" means for product development (20 min)
- LLM-powered interfaces and UX patterns (30 min)
- Copilot design patterns: GitHub Copilot, Google Duet AI, Cursor (30 min)
- Evaluating AI features: accuracy, trust, user experience (20 min)
- AI product management frameworks (20 min)

### Module 6: AI + Data Observability
**Depth**: The intersection that defines the role
**Estimated Study Time**: 1.5 hours
- Natural language querying and Text-to-SQL for data systems (30 min)
- ML-powered anomaly detection for pipeline health (20 min)
- AI copilots for developers and data engineers (20 min)
- Auto-generated data documentation and lineage (20 min)

### Module 7: Developer Experience & IDE Integration
**Depth**: Practical patterns for the "pluggable in workflows" goal
**Estimated Study Time**: 1.5 hours
- Developer experience (DevEx) principles and research (20 min)
- IDE integration patterns: VS Code extensions, JetBrains plugins (30 min)
- CLI tools and CI/CD integration for observability (20 min)
- How developer tools companies embed in workflows (20 min)

## Tech Stack

| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Astro** | Static site generator | Fast, lightweight, perfect for content sites. Ships zero JS by default. |
| **Starlight** | Astro docs theme | Purpose-built for documentation/learning sites. Built-in search, sidebar, dark mode, responsive design. |
| **Preact** | Interactive islands | Lightweight React alternative for Astro islands architecture. |
| **MDX** | Content format | Markdown with component support. Easy to write, easy to update. |
| **Azure OpenAI** | Chat AI backend | GPT-5.2 via Responses API. Client-side streaming calls — no backend needed. |
| **marked.js + DOMPurify** | Markdown rendering in chat | CDN-loaded at runtime. Renders bot responses as formatted markdown safely. |
| **GitHub Pages** | Hosting | Free, integrates with the repo, zero config deployment. |
| **GitHub Actions** | CI/CD | Auto-deploy on push to main. Free for public repos. |

## File Structure

```
Onboarding/
├── astro.config.mjs          # Astro + Starlight + Preact configuration
├── package.json
├── scripts/
│   └── extract-content.mjs   # Build-time MDX → JSON content extraction
├── src/
│   ├── content.config.ts     # Astro content collection config
│   ├── styles/
│   │   └── custom.css        # Starlight theme overrides
│   └── content/
│       └── docs/
│           ├── index.mdx                              # Dashboard/Home page
│           ├── module-1-pipelines-and-observability/
│           │   └── index.mdx
│           ├── module-2-industry-landscape/
│           │   └── index.mdx
│           ├── module-3-google-ecosystem/
│           │   └── index.mdx
│           ├── module-4-ml-ai-infrastructure/
│           │   └── index.mdx
│           ├── module-5-ai-first-strategy/
│           │   └── index.mdx
│           ├── module-6-ai-observability/
│           │   └── index.mdx
│           ├── module-7-developer-experience/
│           │   └── index.mdx
│           └── glossary/
│               └── index.mdx
├── public/
│   ├── chat-loader.js        # Chat sidebar (vanilla JS, injected via <script>)
│   └── content-bundle.json   # Extracted module text for chat context
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment pipeline
├── ARCHITECTURE.md
├── EXECUTION_PLAN.md
├── TASKS.md
├── ForRajdeep.md
└── CLAUDE.md
```

## Data Flow

```
Markdown/MDX Files (content authored here)
        │
        ├──▶ scripts/extract-content.mjs (prebuild step)
        │           │
        │           ▼
        │    public/content-bundle.json (chat context)
        │
        ▼
Astro Build Process (transforms to static HTML)
        │
        ▼
GitHub Actions (auto-builds on push)
        │
        ▼
GitHub Pages (serves static site)
        │
        ▼
Browser (navigates modules + chat sidebar)
        │
        ├──▶ Loads content-bundle.json
        │           │
        │           ▼
        └──▶ Azure OpenAI API (streaming Q&A)
```

## Content Format Per Module

Each module MDX file follows this structure:

```mdx
---
title: "Module X: [Title]"
description: "[One-line description]"
draft: false
---

import { Card, CardGrid, LinkCard } from '@astrojs/starlight/components';

## About This Module
[2-3 paragraph summary of what this module covers and why it matters]

## Section 1: [Topic]
[Summary paragraph with inline citations]

> **Key Insight**: [Notable takeaway from the resources]
> — [Source Name](URL)

### Resources
- 📄 [Article Title](URL) — One-line description
- 🎥 [Video Title](URL) — One-line description
- 📚 [Paper/Book Title](URL) — One-line description

## Section 2: [Topic]
[Same pattern...]

## Key Takeaways
- [Takeaway 1]
- [Takeaway 2]

## Reflect & Apply
- [Question prompting application to the PM role]
- [Question connecting module content to the team's context]

## Estimated Study Time
[X-Y hours]
```

## Dependencies

| Dependency | Purpose | Justification |
|------------|---------|---------------|
| astro | Static site framework | Best-in-class for content sites, zero JS by default |
| @astrojs/starlight | Docs theme | Built-in search, sidebar, dark mode, responsive — saves weeks of UI work |
| @astrojs/preact | Astro integration | Enables Preact components as interactive islands |
| preact | UI framework | Lightweight React alternative for interactive components |
| sharp | Image optimization | Required by Astro for image processing |
| marked (CDN) | Markdown parsing | Renders chat bot responses as formatted HTML |
| dompurify (CDN) | HTML sanitization | Sanitizes rendered markdown to prevent XSS |

## Existing Infrastructure Leveraged
- GitHub repository already exists (Onboarding repo)
- GitHub Pages is free for the repo
- GitHub Actions for CI/CD (free tier sufficient)

## Simplification Decisions
- **No backend**: Pure static site — chat uses client-side API calls directly to Azure OpenAI
- **No custom design**: Starlight's built-in theme provides professional look out of the box
- **No progress persistence**: Keeping it simple — no localStorage or cookies for tracking (chat config stored in localStorage)
- **No custom search**: Starlight includes Pagefind search built-in
- **MDX over a CMS**: Content lives in the repo as files — easy to version, review, and update
- **No RAG pipeline**: Content is small enough (~15K tokens) to send full context with every chat request instead of building embeddings/vector search
- **Vanilla JS over framework component**: Chat sidebar is a single self-contained JS file — simpler to maintain than a Preact component tree

## Trade-offs Accepted

| Trade-off | Chose | Over | Reason |
|-----------|-------|------|--------|
| Framework | Astro/Starlight | Custom Next.js | Speed of delivery over flexibility |
| Content | MDX files in repo | Headless CMS | Simplicity over editorial workflow |
| Design | Starlight defaults | Custom design | Ship fast over pixel-perfect |
| Interactivity | Static content | Interactive quizzes | Scope control — content is the priority |
| Progress tracking | None | localStorage checkboxes | Keep initial scope minimal |
| Chat AI | Azure OpenAI (client-side) | Backend API proxy | No server to maintain; user provides own API config |
| Chat UI | Vanilla JS in public/ | Preact island component | Simpler deployment, no build step needed for chat |
| Chat context | Full content bundle | RAG with embeddings | Content is small; full context avoids complexity |

## Security Considerations
- No user data collected or stored server-side
- No authentication required for the site itself
- Static site — no server-side attack surface
- All resources link to public URLs only
- No Google-internal or confidential content
- Chat API key stored in browser localStorage (user-provided, user-controlled)
- On Azure SWA deployment, config loaded from `chat-config.json` (not committed to repo)
- Chat responses sanitized via DOMPurify before rendering to prevent XSS

## Success Criteria
- [x] All 7 modules have content with proper citations
- [x] Every resource link is verifiable and accessible
- [x] Site deploys successfully to GitHub Pages
- [x] Hub-and-spoke navigation works (dashboard links to all modules)
- [x] Site is mobile-responsive
- [x] Built-in search works across all modules
- [x] Total study time is ~14.5 hours
- [x] A new PM could use this site independently without additional context
- [x] AI chat sidebar answers questions about module content
- [x] Chat supports streaming responses with markdown rendering

## Alternatives Considered

### Alternative 1: Notion Page
- Rejected because: Not a "real" website, harder to customize navigation, less professional for sharing, vendor lock-in

### Alternative 2: Next.js Custom Build
- Rejected because: Overkill for a content site, more setup time, more maintenance, ships unnecessary JavaScript

### Alternative 3: Plain HTML/CSS
- Rejected because: No built-in search, no responsive sidebar, would take longer to build something professional

### Alternative 4: Docusaurus
- Rejected because: More opinionated, heavier, React-based (ships more JS). Starlight is lighter and faster for this use case.

## Decision Log

### 2026-02-11: Scope Reduction — 9 modules to 6, 12 hours total
**Context**: Original 9-module plan estimated 32-46 hours. User requested 12 hours total.
**Decision**: Consolidate to 6 modules by merging related topics:
- Merged "Data Pipelines" + "Data Observability 101" into Module 1
- Merged "Snowflake" + "Databricks" + "Observability Tools" into Module 2
- Trimmed Google Ecosystem, AI Strategy, AI+Observability, and DevEx to essentials
**Rationale**: 12 hours is achievable in ~1 week of focused study. Covers all topics but at a primer/curated depth rather than exhaustive deep dives.
**Impact**: Each module is 1.5-2.5 hours. Resources per section trimmed to 3-5 most essential.

### 2026-02-12: Added Module 4 — ML/AI Infrastructure
**Context**: Gap identified — no module explained the data-to-model journey (feature stores, training pipelines, model serving).
**Decision**: Add a new Module 4: "ML/AI Infrastructure — From Data to Model" (2.5 hours). Renumber old modules 4→5, 5→6, 6→7.
**Rationale**: PM on Core Data team regularly interacts with ML engineers; understanding the infrastructure is critical.
**Impact**: Total study time increased from 12 to 14.5 hours. All cross-references and sidebar config updated.

### 2026-02-12: Chat Feature — Azure OpenAI instead of Gemini
**Context**: Initially planned Gemini API with Preact island components.
**Decision**: Implemented as vanilla JS sidebar using Azure OpenAI GPT-5.2 (Responses API with streaming).
**Rationale**: Azure OpenAI available via existing enterprise access. Vanilla JS simpler than Preact island — single file (`public/chat-loader.js`) with no build step. Supports both GitHub Pages (user-provided config) and Azure SWA (embedded `chat-config.json`).
**Impact**: No Preact components needed for chat. Content extraction pipeline (`scripts/extract-content.mjs`) runs as prebuild step.

### 2026-02-12: Markdown rendering in chat via CDN
**Context**: Bot responses in plain text were hard to read.
**Decision**: Lazy-load marked.js + DOMPurify from CDN to render bot responses as formatted HTML.
**Rationale**: CDN avoids adding npm dependencies for a runtime-only feature. DOMPurify prevents XSS from rendered markdown.

### 2026-03-01: GitHub Pages Chat — Switch from Azure OpenAI to Google Gemini
**Context**: User wants to use Google Gemini instead of Azure OpenAI for the GitHub Pages deployment. Azure SWA deployment stays on Azure OpenAI.
**Mode**: Technical Decision / Mid-Execution Pivot

**Scope**: GitHub Pages deployment only. Azure SWA deployment remains unchanged.

**Decision**: Replace Azure OpenAI with Google Gemini 2.0 Flash in `chat-loader.js` for the GitHub Pages path.

**Approach — Single option (straightforward swap)**:

The Gemini `generateContent` streaming API is a simple REST call. No SDK needed. The changes are confined to `chat-loader.js` and are minimal:

#### What Changes

| Area | Before (Azure OpenAI) | After (Google Gemini) |
|------|----------------------|----------------------|
| **Setup form** | Endpoint URI + API Key | API Key only (endpoint is fixed) |
| **API endpoint** | User-provided full URL | `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key={KEY}` |
| **Auth** | `api-key` header | API key in query string |
| **Request body** | `{ model, input, instructions, stream }` (Responses API) | `{ system_instruction: {parts: [{text}]}, contents: [{role, parts: [{text}]}], generationConfig }` |
| **SSE response** | `data: {"delta": "..."}` or `choices[0].delta.content` | `data: {"candidates": [{"content": {"parts": [{"text": "..."}]}}]}` |
| **Footer text** | "Powered by Azure OpenAI GPT-5.2" | "Powered by Google Gemini" |
| **localStorage key** | `aoai-config` | `gemini-config` |

#### What Stays the Same
- Azure SWA workflow (`.github/workflows/azure-static-web-apps-polite-river-06e40841e.yml`) — untouched
- Azure SWA embedded config path (`chat-config.json` with `endpointUri` + `apiKey`) — untouched
- `deploy.yml` (GitHub Pages) — no changes needed (doesn't inject config)
- Content bundle, markdown rendering, sidebar UI layout, message history — all unchanged
- The embedded config codepath (for Azure SWA) still works with Azure OpenAI format

#### Dual-backend Strategy
The chat-loader.js will support **two backends**:
1. **Embedded config** (`chat-config.json` exists → Azure SWA): Uses Azure OpenAI path (existing code)
2. **localStorage config** (no embedded config → GitHub Pages): Uses Gemini path (new code)

This means we keep the existing Azure OpenAI `streamChat` logic for the SWA deployment and add a separate `streamChatGemini` function for the GitHub Pages path. The `sendMessage` function picks the right one based on whether `embeddedConfig` is set.

#### Files Modified
1. **`public/chat-loader.js`** — All changes here:
   - Add `streamChatGemini()` function (Gemini API format)
   - Update `sendMessage()` to pick Gemini vs Azure based on config source
   - Simplify setup form: single "API Key" field (no endpoint URI)
   - Update placeholder text, labels, footer
   - Change `CONFIG_STORAGE` key to `gemini-config`

#### Success Criteria
- [ ] GitHub Pages chat works with a Google AI Studio API key
- [ ] Azure SWA chat still works with Azure OpenAI (no regression)
- [ ] Setup form shows only API key field (simpler UX)
- [ ] Streaming responses render correctly with markdown

**Rationale**: Gemini 2.0 Flash is free-tier eligible, fast, and the user already has access via Google AI Studio. The API is simple (REST + SSE), no SDK needed. Keeping Azure OpenAI for the SWA path avoids breaking that deployment.

**Impact**: Only `chat-loader.js` changes. No build config, no new dependencies, no workflow changes.

## Open Questions
- ~~Should we add a "Glossary" page?~~ **Yes — included**
- ~~Should modules have reflection questions?~~ **Yes — "Reflect & Apply" section added to each module**
- No remaining open questions

## Status
**Project is complete and deployed.** All modules written, chat feature live, site deployed to GitHub Pages.
