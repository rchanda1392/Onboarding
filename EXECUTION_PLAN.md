# Execution Plan: Chat Interface for Onboarding Site

**Created**: 2026-02-12
**Last Updated**: 2026-02-12
**Status**: Not Started

## Overview

Add a Q&A chat interface to the static Onboarding Resources site. Users can ask questions about the module content in natural language and get answers powered by the Gemini API. The site stays on GitHub Pages (no backend). All module content is bundled at build time and sent as context to Gemini with each question.

## Architecture Reference

See [ARCHITECTURE.md](ARCHITECTURE.md) for the base site design.

### Chat Feature Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser (Client-Side Only)                      │
│                                                   │
│  ┌─────────────────────────────────────────┐     │
│  │  Chat UI (Preact Island)                 │     │
│  │  - Floating chat button (bottom-right)   │     │
│  │  - Expandable chat panel                 │     │
│  │  - Message history                       │     │
│  │  - API key input (first use)             │     │
│  └──────────────┬──────────────────────────┘     │
│                  │                                 │
│  ┌──────────────▼──────────────────────────┐     │
│  │  Content Bundle (built at build time)    │     │
│  │  - All module text as JSON               │     │
│  │  - ~15K tokens total                     │     │
│  └──────────────┬──────────────────────────┘     │
│                  │                                 │
│  ┌──────────────▼──────────────────────────┐     │
│  │  Gemini API Call (client-side fetch)     │     │
│  │  - System prompt + full content context  │     │
│  │  - User question                         │     │
│  │  - Streaming response                    │     │
│  └─────────────────────────────────────────┘     │
│                                                   │
│  API key stored in localStorage (user-provided)   │
└─────────────────────────────────────────────────┘
```

---

## Phases

### Phase 1: Content Extraction Pipeline
**Status**: ⬜ Not Started
**Prerequisites**: None
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 1.1**: Create a build script that extracts text from all MDX files
  - **Files**: `scripts/extract-content.mjs`
  - **Details**: Read all MDX files under `src/content/docs/`, strip frontmatter and MDX components, extract plain text with section headings. Output as `public/content-bundle.json` with structure: `[{ module, title, sections: [{ heading, text }] }]`
  - **Success Criteria**: JSON file contains all module text, is loadable via fetch, < 100KB

- [ ] **Task 1.2**: Integrate extraction into the build pipeline
  - **Files**: `package.json`
  - **Details**: Add a `prebuild` script that runs the extraction before `astro build`
  - **Success Criteria**: `npm run build` produces both the site and the content bundle

#### Checkpoint
- [ ] `public/content-bundle.json` exists with all module content
- [ ] Build pipeline runs extraction automatically
- [ ] Ready for Phase 2

---

### Phase 2: Chat UI Component
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1 complete
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 2.1**: Install Preact and configure Astro for interactive islands
  - **Files**: `package.json`, `astro.config.mjs`
  - **Details**: Install `@astrojs/preact` and `preact`. Add Preact integration to Astro config.
  - **Success Criteria**: Preact components render in Astro pages

- [ ] **Task 2.2**: Build the chat panel UI component
  - **Files**: `src/components/Chat.tsx`
  - **Details**: Create a Preact component with:
    - Floating chat button (bottom-right corner, fixed position)
    - Expandable chat panel (slide up on click)
    - Message list (user messages right-aligned, bot messages left-aligned)
    - Text input with send button
    - "Powered by Gemini" footer
    - Close/minimize button
    - Responsive design (works on mobile)
  - **Success Criteria**: Chat UI opens/closes, messages display, input works

- [ ] **Task 2.3**: Build the API key setup flow
  - **Files**: `src/components/Chat.tsx`
  - **Details**: On first use (no key in localStorage), show a setup screen inside the chat panel:
    - Brief explanation: "Enter your Gemini API key to enable chat"
    - Link to Google AI Studio to get a free key
    - Text input for the key
    - "Save" button that stores key in localStorage
    - "Clear key" option in chat settings
  - **Success Criteria**: Key is persisted across sessions, chat works after key entry

- [ ] **Task 2.4**: Add the chat component to the site layout
  - **Files**: `src/content/docs/index.mdx` (and potentially a custom Starlight layout override)
  - **Details**: Add the Chat island to all pages. Starlight supports custom components via head/body slots or layout overrides.
  - **Success Criteria**: Chat button appears on every page of the site

#### Checkpoint
- [ ] Chat UI renders on all pages
- [ ] Chat opens/closes cleanly
- [ ] API key flow works
- [ ] Ready for Phase 3

---

### Phase 3: Gemini API Integration
**Status**: ⬜ Not Started
**Prerequisites**: Phase 2 complete
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 3.1**: Implement the Gemini API client
  - **Files**: `src/lib/gemini.ts`
  - **Details**: Create a module that:
    - Loads the content bundle from `/content-bundle.json`
    - Constructs a system prompt: "You are a helpful study assistant for a PM onboarding program. Answer questions based ONLY on the following content. Cite the module name when referencing information. If the answer isn't in the content, say so."
    - Calls the Gemini API (`gemini-2.0-flash`) with streaming via the REST API (no SDK needed — just fetch)
    - Returns a streaming response to the chat UI
  - **Success Criteria**: Correct answers returned for questions about module content

- [ ] **Task 3.2**: Wire the Gemini client to the chat UI
  - **Files**: `src/components/Chat.tsx`, `src/lib/gemini.ts`
  - **Details**: Connect the send button to the Gemini client. Show a loading indicator while waiting. Stream the response token-by-token into the chat panel. Handle errors gracefully (invalid key, rate limit, network error).
  - **Success Criteria**: End-to-end Q&A works: ask a question → get a cited answer from the module content

- [ ] **Task 3.3**: Add conversation history support (session-only)
  - **Files**: `src/components/Chat.tsx`, `src/lib/gemini.ts`
  - **Details**: Maintain conversation history in Preact component state (last 10 messages). Send history with each request so Gemini has context for follow-up questions. History resets on page refresh or tab close — no persistence needed. Add a "New Chat" button to clear history within a session.
  - **Success Criteria**: Follow-up questions work within a session; history resets on refresh

#### Checkpoint
- [ ] Chat answers questions accurately from module content
- [ ] Streaming responses work
- [ ] Conversation context is maintained
- [ ] Error handling works (bad key, network issues)
- [ ] Ready for Phase 4

---

### Phase 4: Polish & Deploy
**Status**: ⬜ Not Started
**Prerequisites**: Phase 3 complete
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 4.1**: Style the chat to match the Starlight theme
  - **Files**: `src/components/Chat.tsx`
  - **Details**: Match colors/fonts to Starlight's dark and light mode. Use CSS variables from Starlight's theme. Ensure the chat panel doesn't overlap with sidebar or content.
  - **Success Criteria**: Chat looks native to the site in both light and dark mode

- [ ] **Task 4.2**: Build verification
  - **Details**: Run `npm run build`, verify all pages still build (9 pages), chat component loads, content bundle is generated.
  - **Success Criteria**: Clean build, no errors

- [ ] **Task 4.3**: Commit and deploy
  - **Details**: Commit all changes, push to main, verify GitHub Actions deploys successfully and chat works on the live site.
  - **Success Criteria**: Chat is live at https://rchanda1392.github.io/Onboarding/

#### Checkpoint
- [ ] Chat works on live site
- [ ] Dark/light mode support
- [ ] All existing pages still work
- [ ] ForRajdeep.md updated with chat feature details

---

## Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini API key exposed in browser DevTools | Medium | Low | Key is user-provided, not ours. User controls their own key/billing. |
| Content bundle too large for context window | Low | High | Total content is ~15K tokens; Gemini Flash supports 1M tokens. No risk. |
| CORS issues calling Gemini API from browser | Low | Medium | Google's Gemini API supports CORS for browser calls with API key auth. |
| Chat component breaks Starlight layout | Medium | Medium | Use Astro's `client:only` directive and fixed positioning to isolate the chat from page layout. |

## Open Questions

- [x] Which Gemini model? → `gemini-2.0-flash` (fast, cheap, large context)
- [x] How to handle API key? → User-provided, stored in localStorage
- [x] SDK vs raw fetch? → Raw fetch (smaller bundle, no dependency)

## Notes & Decisions

- **2026-02-12**: Plan created for chat feature. Using client-side Gemini API calls to keep the site on GitHub Pages (no backend). Content is small enough (~15K tokens) to send full context with every request instead of building a RAG pipeline with embeddings/vector search.
