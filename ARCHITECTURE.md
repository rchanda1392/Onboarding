# Architecture: PM Onboarding Study Plan Website

## Problem Statement

A new Product Manager joining Google's Core Data team needs to rapidly onboard on data observability, pipeline monitoring, AI-first product strategy, and the Google internal ecosystem. The team manages pipelines for Google Maps data and Google Gemini pre/post training data, and is building an internal observability platform similar to what Snowflake and Databricks offer externally.

The study plan must be a navigable website with modular content, where every piece of information is backed by a citation to a real resource (article, video, paper, or documentation).

## Requirements

### Must Have
- Hub-and-spoke website with a central dashboard linking to independent modules
- 6 focused study modules covering all critical onboarding topics (~12 hours total)
- Every content section backed by citations (articles, videos, papers, docs)
- Resource summaries and/or embedded YouTube videos per section
- Estimated study time per module
- Mobile-responsive design
- Free hosting (GitHub Pages)
- Shareable with future PMs joining the team

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

A static website built with **Astro + Starlight** deployed on **GitHub Pages**. The site uses a hub-and-spoke navigation model with a central dashboard that links to 6 focused study modules (~12 hours total). Each module is a Markdown/MDX page with cited resources, summaries, and embedded media.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  GitHub Pages                     │
│              (Free Static Hosting)                │
├─────────────────────────────────────────────────┤
│                                                   │
│   ┌───────────────────────────────────────┐      │
│   │         Dashboard (Home Page)          │      │
│   │                                        │      │
│   │   ┌──────┐ ┌──────┐ ┌──────┐         │      │
│   │   │ Mod 1│ │ Mod 2│ │ Mod 3│         │      │
│   │   └──────┘ └──────┘ └──────┘         │      │
│   │   ┌──────┐ ┌──────┐ ┌──────┐         │      │
│   │   │ Mod 4│ │ Mod 5│ │ Mod 6│         │      │
│   │   └──────┘ └──────┘ └──────┘         │      │
│   │          + Glossary page               │      │
│   └───────────────────────────────────────┘      │
│                                                   │
│   Built with: Astro + Starlight                  │
│   Content: Markdown/MDX files                     │
│   Styling: Starlight defaults + custom CSS        │
│                                                   │
└─────────────────────────────────────────────────┘
```

## Modules (6 modules, ~12 hours total)

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

### Module 4: AI-First Product Strategy
**Depth**: Focused on actionable frameworks
**Estimated Study Time**: 2 hours
- What "AI-first" means for product development (20 min)
- LLM-powered interfaces and UX patterns (30 min)
- Copilot design patterns: GitHub Copilot, Google Duet AI, Cursor (30 min)
- Evaluating AI features: accuracy, trust, user experience (20 min)
- AI product management frameworks (20 min)

### Module 5: AI + Data Observability
**Depth**: The intersection that defines the role
**Estimated Study Time**: 1.5 hours
- Natural language querying and Text-to-SQL for data systems (30 min)
- ML-powered anomaly detection for pipeline health (20 min)
- AI copilots for developers and data engineers (20 min)
- Auto-generated data documentation and lineage (20 min)

### Module 6: Developer Experience & IDE Integration
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
| **MDX** | Content format | Markdown with component support. Easy to write, easy to update. |
| **GitHub Pages** | Hosting | Free, integrates with the repo, zero config deployment. |
| **GitHub Actions** | CI/CD | Auto-deploy on push to main. Free for public repos. |

## File Structure

```
Onboarding/
├── astro.config.mjs          # Astro + Starlight configuration
├── package.json
├── src/
│   ├── content/
│   │   └── docs/
│   │       ├── index.mdx                    # Dashboard/Home page
│   │       ├── module-1-pipelines-and-observability/
│   │       │   └── index.mdx
│   │       ├── module-2-industry-landscape/
│   │       │   └── index.mdx
│   │       ├── module-3-google-ecosystem/
│   │       │   └── index.mdx
│   │       ├── module-4-ai-first-strategy/
│   │       │   └── index.mdx
│   │       ├── module-5-ai-observability/
│   │       │   └── index.mdx
│   │       ├── module-6-developer-experience/
│   │       │   └── index.mdx
│   │       └── glossary/
│   │           └── index.mdx
│   └── assets/               # Images, diagrams
├── public/                    # Static assets
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
Browser (user navigates hub-and-spoke modules)
```

## Content Format Per Module

Each module MDX file follows this structure:

```mdx
---
title: "Module X: [Title]"
description: "[One-line description]"
---

import { Card, CardGrid, LinkCard } from '@astrojs/starlight/components';

## Overview
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
| sharp | Image optimization | Required by Astro for image processing |

## Existing Infrastructure Leveraged
- GitHub repository already exists (Onboarding repo)
- GitHub Pages is free for the repo
- GitHub Actions for CI/CD (free tier sufficient)

## Simplification Decisions
- **No backend**: Pure static site — no database, no auth, no API
- **No custom design**: Starlight's built-in theme provides professional look out of the box
- **No progress persistence**: Keeping it simple — no localStorage or cookies for tracking
- **No custom search**: Starlight includes Pagefind search built-in
- **MDX over a CMS**: Content lives in the repo as files — easy to version, review, and update

## Trade-offs Accepted

| Trade-off | Chose | Over | Reason |
|-----------|-------|------|--------|
| Framework | Astro/Starlight | Custom Next.js | Speed of delivery over flexibility |
| Content | MDX files in repo | Headless CMS | Simplicity over editorial workflow |
| Design | Starlight defaults | Custom design | Ship fast over pixel-perfect |
| Interactivity | Static content | Interactive quizzes | Scope control — content is the priority |
| Progress tracking | None | localStorage checkboxes | Keep initial scope minimal |

## Security Considerations
- No user data collected or stored
- No authentication required
- Static site — no server-side attack surface
- All resources link to public URLs only
- No Google-internal or confidential content

## Success Criteria
- [ ] All 6 modules have content with proper citations
- [ ] Every resource link is verifiable and accessible
- [ ] Site deploys successfully to GitHub Pages
- [ ] Hub-and-spoke navigation works (dashboard links to all modules)
- [ ] Site is mobile-responsive
- [ ] Built-in search works across all modules
- [ ] Total study time is ~12 hours
- [ ] A new PM could use this site independently without additional context

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

## Open Questions
- ~~Should we add a "Glossary" page?~~ **Yes — included**
- ~~Should modules have reflection questions?~~ **Yes — "Reflect & Apply" section added to each module**
- No remaining open questions

## Next Steps
1. Run `/plan` to create execution plan
2. Research and compile real resources for all 6 modules
3. Build the Astro + Starlight site
4. Write module content with citations
5. Deploy to GitHub Pages
