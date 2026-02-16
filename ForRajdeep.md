# ForRajdeep: How We Built Your Onboarding Study Plan Website

Welcome to the behind-the-scenes story of your PM Onboarding site. This isn't a boring technical spec — it's a walkthrough of *how* we built this, *why* we made the decisions we did, *what* broke along the way, and *what you can learn* from the whole process. Think of it as the engineering postmortem you'd write at Google, but for a website build.

---

## The Big Picture: What Did We Build?

We built a **static documentation website** that serves as a 14.5-hour study plan for a Product Manager joining Google's Core Data team. It has:

- A **dashboard** (home page) with cards linking to 7 study modules
- **7 content-rich modules** covering data pipelines, industry landscape, Google's ecosystem, ML/AI infrastructure, AI strategy, AI + observability, and developer experience
- A **glossary** of 50+ key terms
- **Built-in search** (powered by Pagefind) across all content
- **Dark mode**, responsive design, and sidebar navigation — all for free
- **AI-powered chat sidebar** — ask questions about any module content and get cited answers
- **Auto-deploy** to GitHub Pages on every push to `main`

The whole thing runs on zero backend infrastructure. It's pure static HTML — no database, no server, no auth. The chat feature makes client-side API calls directly to Azure OpenAI, so even that doesn't need a backend.

---

## The Tech Stack (and Why Each Piece)

### Astro — The Static Site Generator

**What it is**: Astro is a modern static site generator that builds content-focused websites. It takes your Markdown/MDX files and turns them into fast, static HTML pages.

**Why we chose it**: Astro ships **zero JavaScript by default**. For a content site like this, that's ideal — pages load instantly because there's no JS bundle to download and parse. Next.js would have been overkill (it's designed for interactive apps, not content sites). Plain HTML would have taken 10x longer to build and wouldn't have search, sidebar, or dark mode.

**The analogy**: If Next.js is a Swiss Army knife, Astro is a chef's knife — specialized for one job (content sites) and exceptionally good at it.

### Starlight — The Documentation Theme

**What it is**: Starlight is an Astro plugin purpose-built for documentation and learning sites. It gives you sidebar navigation, full-text search, dark mode, responsive design, and a table of contents — all out of the box.

**Why we chose it**: Building all those features from scratch would have taken weeks. Starlight gave us a professional-looking site in minutes. The tradeoff is less design flexibility, but for a study plan site, the default design is more than good enough.

**The analogy**: Starlight is like moving into a furnished apartment instead of an empty one. You lose the ability to choose every piece of furniture, but you can start living (reading content) immediately.

### MDX — Content Format

**What it is**: MDX is Markdown with component support. You write content in regular Markdown (headings, lists, links, bold text) but can also embed interactive components like cards and grids.

**Why it matters**: Content authors (you!) can update any module by editing a `.mdx` file. No React, no HTML templates, no build knowledge needed. Just open the file, edit the Markdown, push to GitHub, and the site auto-deploys.

### GitHub Pages + GitHub Actions — Hosting & Deployment

**What it is**: GitHub Pages hosts static sites for free. GitHub Actions automates the build-and-deploy process.

**How it works**:
```
You push to main → GitHub Actions runs → Astro builds the site → Pages serves it
```

The workflow file (`.github/workflows/deploy.yml`) handles everything. You never manually build or upload anything.

---

## Codebase Structure: How the Pieces Connect

```
Onboarding/
├── astro.config.mjs          ← Site configuration (title, sidebar, base URL)
├── package.json               ← Dependencies and scripts
├── tsconfig.json              ← TypeScript config (extends Astro defaults)
├── src/
│   ├── content.config.ts      ← Tells Astro about the "docs" content collection
│   └── content/
│       └── docs/
│           ├── index.mdx                              ← Dashboard (home page)
│           ├── module-1-pipelines-and-observability/
│           │   └── index.mdx                          ← Module 1 content
│           ├── module-2-industry-landscape/
│           │   └── index.mdx                          ← Module 2 content
│           ├── module-3-google-ecosystem/
│           │   └── index.mdx                          ← Module 3 content
│           ├── module-4-ml-ai-infrastructure/
│           │   └── index.mdx                          ← Module 4 content
│           ├── module-5-ai-first-strategy/
│           │   └── index.mdx                          ← Module 5 content
│           ├── module-6-ai-observability/
│           │   └── index.mdx                          ← Module 6 content
│           ├── module-7-developer-experience/
│           │   └── index.mdx                          ← Module 7 content
│           └── glossary/
│               └── index.mdx                          ← Glossary
├── .github/
│   └── workflows/
│       └── deploy.yml         ← GitHub Actions deployment pipeline
├── ARCHITECTURE.md            ← Full design document
├── EXECUTION_PLAN.md          ← Phased build plan
├── TASKS.md                   ← Task tracking
└── ForRajdeep.md              ← You're reading it!
```

### The data flow:

1. **You write content** in `.mdx` files under `src/content/docs/`
2. **Astro reads** the content collection (configured in `content.config.ts`)
3. **Starlight generates** HTML pages with sidebar, search, dark mode, etc.
4. **Pagefind indexes** all generated HTML for full-text search
5. **GitHub Actions builds** the site on push to `main`
6. **GitHub Pages serves** the static files from `dist/`

The key insight: **all the "smart" stuff happens at build time**, not at runtime. When a user visits your site, they're just loading pre-built HTML files from a CDN. No server processing, no database queries, no API calls.

---

## The Bug That Almost Broke Everything: `draft: false`

This is the most interesting engineering lesson from the build. Here's what happened:

### The Symptom
After setting up the entire Astro + Starlight project with all 9 pages (dashboard + 7 modules + glossary), the production build generated **only 1 page** (the 404 error page). Zero content pages. But the dev server worked perfectly.

### The Investigation
- `npm run dev` served all pages correctly → ✅
- `npm run build` generated 0 content pages → ❌
- No error messages, no warnings, no crashes. Just... silence.

This is one of the hardest kinds of bugs — **the silent failure**. The system didn't crash; it just quietly produced wrong output.

### The Root Cause
Deep in Starlight's routing code, there's a filter that runs during production builds:

```javascript
await getCollection('docs', ({ data }) => {
  return import.meta.env.MODE !== 'production' || data.draft === false;
});
```

This says: "In production, only include pages where `draft` is explicitly `false`."

The Starlight schema defines `draft` with a Zod default of `false`:
```javascript
draft: z.boolean().default(false)
```

So in theory, pages without a `draft` field should default to `draft: false` and be included. **But the default wasn't being applied during the build.** This appears to be a bug in how Astro 5's content layer handles Zod defaults in production mode.

### The Fix
Add `draft: false` explicitly to every MDX file's frontmatter:
```yaml
---
title: "Module 1: Data Pipelines & Observability Foundations"
description: "ETL vs ELT, the 5 pillars of data observability..."
draft: false    ← This line saved the project
---
```

### The Lesson
**Silent failures are the most dangerous kind.** This is directly analogous to data observability — a pipeline that "succeeds" but produces wrong output is harder to catch than one that crashes. This is literally what Module 1 teaches:

> "Software failures are loud, data failures are silent."

We experienced a mini version of exactly this problem while building the site that teaches about this problem. Meta.

### How Good Engineers Think About This

1. **Don't trust defaults.** Even when a framework says "this defaults to X," verify that the default is actually applied in all contexts. Build environments can behave differently from dev environments.

2. **Check outputs, not just exit codes.** The build command exited with code 0 (success). But it produced 0 pages. A good CI pipeline would check "did we produce at least N pages?" not just "did the build command succeed?"

3. **Bisect the problem.** We confirmed dev mode worked but build didn't. Then we tested adding `draft: false` to one page and confirmed it appeared in the build. Then we applied it to all pages. Systematic narrowing, not guessing.

---

## Architecture Decisions: Why We Made These Choices

### Why a static site instead of a dynamic app?

| Consideration | Static (Astro) | Dynamic (Next.js, etc.) |
|---|---|---|
| **Build time** | Fast — hours, not days | Slower — more setup, more features to build |
| **Hosting cost** | Free (GitHub Pages) | Free tier possible but more complex |
| **Maintenance** | Near zero — no server to manage | Server/API to maintain |
| **Performance** | Blazing fast (just HTML) | Depends on implementation |
| **Content updates** | Edit MDX → push → auto-deploy | Same, but more moving parts |
| **Search** | Pagefind (built-in, client-side) | Would need Algolia or custom backend |
| **Progress tracking** | Not supported | Could add with localStorage or backend |

We chose static because **the content is the product**. There's no user interaction that requires a server. A static site is simpler, cheaper, faster, and more reliable.

### Why Starlight instead of building our own design?

Building a custom design would have taken a week. Starlight gave us:
- Sidebar navigation (configured in `astro.config.mjs`)
- Full-text search (Pagefind, zero config)
- Dark mode (automatic)
- Mobile responsive (automatic)
- Table of contents (automatic, from headings)
- Accessible design (WCAG compliant out of the box)

The tradeoff: the site looks like "a Starlight site." It's professional and clean, but not unique. For a study plan that will be used by a handful of PMs, this is the right tradeoff.

### Why MDX instead of a CMS?

A headless CMS (like Contentful or Sanity) would add complexity without proportional value. MDX files:
- Live in the git repo (version controlled, reviewable)
- Require no external service
- Can be edited by anyone with a text editor
- Support Markdown (easy) plus components (powerful when needed)

---

## Module 4: The ML/AI Infrastructure Deep Dive

The newest addition to the curriculum deserves its own callout. Module 4 ("ML/AI Infrastructure — From Data to Model") fills a critical gap in the study plan: none of the original 6 modules explained **what actually happens between having data and having a working ML model**.

### Why This Module Matters for PMs

As a PM on the Core Data team, you'll regularly interact with ML researchers and engineers. They'll say things like "we need more labeled data," "there's training-serving skew in the feature pipeline," or "the model is drifting." Without understanding the data-to-model journey, these conversations are opaque. With it, you can ask the right follow-up questions, set realistic timelines, and prioritize infrastructure investments.

### How We Structured It

The module has two "modes" woven together:

1. **Systems view** — The technical infrastructure (feature stores, training pipelines, model serving, monitoring)
2. **Researcher narrative** — What an ML researcher's actual day looks like, from problem framing to production deployment

This dual approach means you learn both *what the systems do* and *why they exist in the context of someone's workflow*. It's the difference between reading a restaurant's equipment list vs. watching a chef cook a meal.

### The Renumbering Adventure

Adding this module as Module 4 (between Google Ecosystem and AI Strategy) required renumbering modules 4→5, 5→6, 6→7. This meant updating:
- 3 folder names
- 3 module titles in MDX frontmatter
- All cross-references between modules (Module 5's "About" section references Module 4 for context)
- The sidebar config, dashboard cards, reading order table
- ~20 glossary entries that link back to specific modules

**The engineering lesson**: Renumbering sounds simple but has a surprisingly large blast radius when content cross-references itself. If we'd anticipated this from the start, we might have used slug-based references (like `ai-first-strategy`) instead of numbered ones. This is analogous to using foreign keys vs. hardcoded IDs in a database — one is resilient to changes, the other is brittle.

---

## The Chat Sidebar: AI-Powered Q&A Without a Backend

The most technically interesting addition to the site is the **Study Assistant** — a chat sidebar on every page that lets you ask questions about the study content and get answers powered by Azure OpenAI GPT-5.2.

### The Problem It Solves

You've got 14.5 hours of study material across 7 modules. Sometimes you want to quickly check "did any module cover feature stores?" or "what's the difference between batch and streaming pipelines?" without scanning through every page. The chat lets you ask in natural language and get a cited answer pointing you to the right module.

### How It Works (The Clever Bit)

Here's the trick: this is a **static site** on GitHub Pages. No backend. No server. So how does the chat work?

```
Build time:  MDX files → extract-content.mjs → content-bundle.json
Runtime:     User question + content-bundle.json → Azure OpenAI API → Streamed answer
```

1. **At build time**, a script (`scripts/extract-content.mjs`) reads every MDX file, strips out the frontmatter and component syntax, and saves the plain text as `public/content-bundle.json`. This runs automatically before every build via the `prebuild` npm script.

2. **At runtime**, when you ask a question, the chat loads `content-bundle.json` (once, then cached), stuffs the entire content into the system prompt, and sends your question to Azure OpenAI. The total content is about 15K tokens — well within GPT-5.2's context window — so we don't need a fancy RAG pipeline with embeddings and vector search. We just send everything.

3. **The response streams back** token-by-token, so you see the answer being typed out in real time rather than waiting for the full response.

### Why Vanilla JS Instead of a Framework Component?

The original plan was to build the chat as a Preact component (Astro's "island architecture" for interactive widgets). We pivoted to a single vanilla JavaScript file (`public/chat-loader.js`) for a few reasons:

- **Simplicity**: One self-contained file, no build step for the chat itself. It's injected via a `<script>` tag in Starlight's head config.
- **DOM manipulation**: The chat is mostly creating DOM elements and handling events — exactly what vanilla JS is good at. A framework adds overhead without proportional benefit for this kind of widget.
- **Deployment flexibility**: The same file works on GitHub Pages and Azure Static Web Apps without changes.

**The analogy**: If the Astro/Starlight site is a well-organized kitchen with designated stations, the chat sidebar is like a food truck parked next to it. It does its own thing, serves from its own counter, but complements the main restaurant.

### The Dual-Config Pattern

The chat supports two hosting environments with a neat configuration pattern:

- **GitHub Pages** (public): Users provide their own Azure OpenAI endpoint URI and API key. It's stored in `localStorage` so they only enter it once. A settings gear lets them reset it.
- **Azure Static Web Apps** (internal): A `chat-config.json` file is deployed alongside the site with pre-configured credentials. The setup screen never appears — the chat just works.

The code checks for `chat-config.json` first (Azure), then falls back to `localStorage` (GitHub Pages). This means the same codebase serves both audiences without any if-else branching in the deployment pipeline.

### Markdown Rendering in Chat

Bot responses come back as raw text from the API, but they contain markdown formatting (bold, lists, code blocks, tables). We lazy-load two libraries from CDN — **marked.js** (markdown parser) and **DOMPurify** (HTML sanitizer) — to render responses as nicely formatted HTML. The DOMPurify step is a security best practice: even though we control the system prompt, the AI's output could theoretically include HTML that we don't want injected into the page.

**The engineering lesson**: Always sanitize HTML that comes from an external source, even if that source is an AI you control. This is the same principle as SQL injection prevention — don't trust inputs, even "friendly" ones.

---

## How to Update Content

### Adding or editing a module:
1. Open the relevant file under `src/content/docs/`
2. Edit the Markdown content
3. Push to `main`
4. Wait ~2 minutes for GitHub Actions to build and deploy
5. Site is live with your changes

### Adding a new page:
1. Create a new folder under `src/content/docs/` (e.g., `new-page/`)
2. Add an `index.mdx` file with frontmatter (including `draft: false`!)
3. Add the page to the sidebar in `astro.config.mjs`
4. Push to `main`

### Important: Always include `draft: false`
Because of the bug described above, **every new MDX file must include `draft: false` in its frontmatter**. Without it, the page will work in dev mode but disappear from the production build.

---

## Lessons You Can Learn From This Build

### 1. Simplicity wins
We could have built a React app with a custom design system, user authentication, progress tracking, and a backend API. Instead, we built a static site with Markdown files. It took a fraction of the time and serves the purpose perfectly.

**The principle**: The right amount of complexity is the minimum needed for the current task. Three lines of Markdown are better than a premature React component.

### 2. Build, then write
We scaffolded the entire site structure first (empty pages, working navigation, build pipeline), then filled in content. This meant we could verify the infrastructure worked before investing time in content. If we'd written all the content first and then tried to build the site, the `draft: false` bug would have been much more painful to debug.

**The principle**: Get the skeleton working end-to-end before fleshing out the details. This is true for websites, data pipelines, and product launches.

### 3. Every claim needs a citation
The architecture document required "no content without citation." This constraint forced discipline in content creation — every summary, every key insight, every resource recommendation is backed by a verifiable source. This is a good practice for any PM document: assertions without evidence are just opinions.

### 4. The workflow matters as much as the code
We used a structured workflow: `/brainstorm` → `/plan` → `/execute` → `/review`. Each step produced a document (ARCHITECTURE.md → EXECUTION_PLAN.md → TASKS.md). This meant we always knew what to build next and could track progress. The overhead of planning paid for itself many times over in execution speed.

**The principle**: Time spent planning is almost always paid back with interest during execution. This is especially true for projects with scope decisions (how many modules? how deep? what technologies?).

### 5. Frameworks save time, but you pay in understanding
Starlight gave us search, dark mode, and responsive design for free. But when the `draft: false` bug hit, we had to dig through Starlight's source code to understand the routing system. Framework magic is great until it breaks — then you need to understand the internals.

**The principle**: Use frameworks to go fast, but be prepared to read their source code when things go wrong.

---

## What a Good Engineer Would Do Next

If this were a production project at Google, the next steps would be:

1. **Add link checking** — Verify all 60+ resource URLs are still live (links rot over time)
2. **Add progress tracking** — localStorage-based checkboxes so users can track what they've read
3. **Add a CI check** — Verify the build produces the expected number of pages (catching the `draft: false` bug automatically)
4. **Collect feedback** — Add a "Was this helpful?" mechanism to each module
5. **Update quarterly** — Resources go stale; new tools and frameworks emerge. Schedule quarterly content reviews.
6. **Chat analytics** — Track which questions users ask most to identify content gaps
7. **Chat conversation persistence** — Currently history resets on page refresh. Could persist in localStorage for continuity.

---

*This document was written as part of the build process and updated as features were added. It covers the project from conception through deployment, including the bugs, the decisions, and the lessons. If something about the project confuses you, this is the place to start.*
