# Execution Plan: Playwright E2E Testing Loop

**Created**: 2026-02-16
**Last Updated**: 2026-02-16
**Status**: Not Started

## Overview

Add end-to-end testing with Playwright that verifies all 9 pages render correctly, navigation works, interactive elements (sidebar, search, chat widget) function, and the site builds without errors. The test suite runs against the **live Azure SWA deployment** (`https://polite-river-06e40841e.6.azurestaticapps.net`) and includes **visual regression screenshots** to catch unintended UI changes.

## Architecture Reference

No `ARCHITECTURE.md` for testing — this plan is derived from codebase exploration of the Astro + Starlight site (9 pages, chat sidebar, Starlight navigation/search).

---

## Phases

### Phase 1: Scaffold Playwright Infrastructure
**Status**: ⬜ Not Started
**Prerequisites**: None
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 1.1**: Install Playwright as a dev dependency
  - **Details**: `npm i -D @playwright/test` then `npx playwright install --with-deps chromium` (Chromium only to keep it fast)
  - **Success Criteria**: `npx playwright --version` succeeds

- [ ] **Task 1.2**: Create `playwright.config.ts`
  - **Files**: `playwright.config.ts`
  - **Details**: Configure:
    - `baseURL`: `https://polite-river-06e40841e.6.azurestaticapps.net` (live Azure SWA)
    - No `webServer` needed — tests run against the live deployment
    - `projects`: Chromium only (lightweight)
    - `retries`: 1 on CI, 0 locally
    - `outputDir`: `test-results/`
    - `expect.toHaveScreenshot`: configure with `maxDiffPixelRatio: 0.01` for visual regression tolerance
    - `snapshotPathTemplate`: `{testDir}/__screenshots__/{testFilePath}/{arg}{ext}` for organized baseline storage
  - **Success Criteria**: Config file exists and Playwright recognizes it

- [ ] **Task 1.3**: Add npm scripts for testing
  - **Files**: `package.json`
  - **Details**: Add `"test": "playwright test"` and `"test:ui": "playwright test --ui"`
  - **Success Criteria**: `npm test` invokes Playwright

- [ ] **Task 1.4**: Update `.gitignore` for test artifacts
  - **Files**: `.gitignore`
  - **Details**: Add `test-results/`, `playwright-report/`, `blob-report/`. Do NOT ignore `tests/__screenshots__/` — baseline screenshots must be committed to git.
  - **Success Criteria**: Test artifacts excluded from git, but screenshot baselines tracked

#### Checkpoint
- [ ] `npm test` runs Playwright (even with no tests yet)
- [ ] No changes to existing site functionality

---

### Phase 2: Smoke Loop — Every Page Renders
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1
**Estimated Scope**: Medium

This is the core "testing loop" — a data-driven test that iterates over every route.

#### Tasks
- [ ] **Task 2.1**: Create data-driven smoke test for all 9 pages
  - **Files**: `tests/smoke.spec.ts`
  - **Details**: Define a routes array, then loop with `test.describe` / `for...of`:
    ```ts
    const pages = [
      { path: '/', title: 'Onboarding Guide' },
      { path: '/module-1-pipelines-and-observability/', title: 'Data Pipelines' },
      { path: '/module-2-industry-landscape/', title: 'Industry Landscape' },
      { path: '/module-3-google-ecosystem/', title: 'Google' },
      { path: '/module-4-ml-ai-infrastructure/', title: 'ML/AI' },
      { path: '/module-5-ai-first-strategy/', title: 'AI-First' },
      { path: '/module-6-ai-observability/', title: 'Observability' },
      { path: '/module-7-developer-experience/', title: 'Developer Experience' },
      { path: '/glossary/', title: 'Glossary' },
    ];
    for (const pg of pages) {
      test(`${pg.path} loads and renders`, ...);
    }
    ```
    For each page: navigate, assert `<main>` visible, assert title contains expected substring.
  - **Success Criteria**: All 9 pages return 200 and render `<main>`

- [ ] **Task 2.2**: Assert no console errors on any page
  - **Files**: `tests/smoke.spec.ts` (extend)
  - **Details**: Attach `page.on('console')` listener, collect `error`-level entries, assert zero per page
  - **Success Criteria**: Zero unexpected console errors across all pages

#### Checkpoint
- [ ] `npm test` passes with 9+ green tests
- [ ] Every page confirmed renderable in headless Chromium

---

### Phase 3: Navigation & Sidebar Tests
**Status**: ⬜ Not Started
**Prerequisites**: Phase 2
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 3.1**: Test sidebar navigation links
  - **Files**: `tests/navigation.spec.ts`
  - **Details**: Start on Dashboard → click each sidebar "Study Modules" link → assert URL changes → assert `<h1>` matches module title
  - **Success Criteria**: All 7 module links navigate correctly

- [ ] **Task 3.2**: Test Dashboard card links
  - **Files**: `tests/navigation.spec.ts`
  - **Details**: On Dashboard, click CardGrid links + "Start with Module 1" hero button → verify correct destination
  - **Success Criteria**: All dashboard cards route correctly

- [ ] **Task 3.3**: Test Starlight search
  - **Files**: `tests/navigation.spec.ts`
  - **Details**: Open search (`Ctrl+K`), type "pipeline", assert results appear, click a result → verify navigation
  - **Success Criteria**: Search works end-to-end

#### Checkpoint
- [ ] All navigation paths verified
- [ ] Site fully navigable via sidebar, cards, and search

---

### Phase 4: Chat Widget Tests
**Status**: ⬜ Not Started
**Prerequisites**: Phase 2
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 4.1**: Test chat widget renders on every page
  - **Files**: `tests/chat.spec.ts`
  - **Details**: Visit each page → assert chat container is visible → assert setup screen appears (no stored credentials in test browser)
  - **Success Criteria**: Chat widget DOM present on all 9 pages

- [ ] **Task 4.2**: Test chat setup form interaction
  - **Files**: `tests/chat.spec.ts`
  - **Details**: Fill endpoint URI + API key with dummy values → submit → assert transition from setup to chat interface → assert composer textarea visible
  - **Success Criteria**: Setup form works and transitions to chat view

- [ ] **Task 4.3**: Test chat send + error handling (no real API)
  - **Files**: `tests/chat.spec.ts`
  - **Details**: After dummy setup, type message → send → assert user message appears → assert graceful error (API fails with dummy creds, should show error message not crash)
  - **Success Criteria**: Chat handles failed API calls gracefully

#### Checkpoint
- [ ] Chat widget verified on all pages
- [ ] Chat UI tested: setup → compose → send → error handling

---

### Phase 5: Content Integrity Tests
**Status**: ⬜ Not Started
**Prerequisites**: Phase 2
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 5.1**: Verify each module has expected structural elements
  - **Files**: `tests/content.spec.ts`
  - **Details**: For each module: assert `<h1>` exists, "About This Module" heading exists, at least one content section
  - **Success Criteria**: All modules have key structural elements

- [ ] **Task 5.2**: Verify glossary has alphabetical sections
  - **Files**: `tests/content.spec.ts`
  - **Details**: Visit `/glossary/` → assert multiple `<h2>` letter headings → assert 10+ terms present
  - **Success Criteria**: Glossary renders correctly

- [ ] **Task 5.3**: Verify content-bundle.json is accessible and valid
  - **Files**: `tests/content.spec.ts`
  - **Details**: Fetch `/content-bundle.json` → assert 200 → assert valid JSON → assert entries for all 7 modules
  - **Success Criteria**: Chat's content bundle is complete

#### Checkpoint
- [ ] Content structure validated across all modules and glossary
- [ ] Content bundle verified for chat feature

---

### Phase 6: Visual Regression Screenshots
**Status**: ⬜ Not Started
**Prerequisites**: Phase 2
**Estimated Scope**: Medium

#### Tasks
- [ ] **Task 6.1**: Add full-page screenshot baselines for all 9 pages
  - **Files**: `tests/visual.spec.ts`
  - **Details**: Data-driven test (same routes array as smoke). For each page:
    1. Navigate and wait for `networkidle` (ensures CDN assets like marked.js load)
    2. Hide dynamic elements that cause flaky diffs (e.g., chat widget cursor blink) via `page.addStyleRule` or mask option
    3. `await expect(page).toHaveScreenshot('page-name.png', { fullPage: true })`
    4. First run with `--update-snapshots` to generate baselines
  - **Success Criteria**: Baseline screenshots generated and committed for all 9 pages

- [ ] **Task 6.2**: Add component-level screenshot tests for key UI elements
  - **Files**: `tests/visual.spec.ts`
  - **Details**: Targeted screenshots of:
    - Dashboard hero section (`.hero` locator)
    - Dashboard CardGrid (module cards)
    - Sidebar navigation panel
    - Chat widget setup screen
    - Chat widget after dummy login (chat interface)
  - **Success Criteria**: Component baselines generated for 5 key UI areas

- [ ] **Task 6.3**: Document the visual regression workflow
  - **Files**: `tests/README.md`
  - **Details**: Short doc explaining:
    - How to update baselines: `npx playwright test --update-snapshots`
    - When to update: after intentional UI changes
    - How to review diffs: `npx playwright show-report`
    - Tolerance config (`maxDiffPixelRatio: 0.01`)
  - **Success Criteria**: Any team member can understand the screenshot workflow

#### Checkpoint
- [ ] All 9 pages have full-page baseline screenshots committed
- [ ] 5 component-level baselines committed
- [ ] `npm test` catches visual regressions (modify CSS → test fails)

---

### Phase 7: CI Integration
**Status**: ⬜ Not Started
**Prerequisites**: Phase 6
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 7.1**: Add Playwright GitHub Actions workflow
  - **Files**: `.github/workflows/test.yml`
  - **Details**: Trigger on PR + push to main → Node 20 → `npm ci` → `npx playwright install --with-deps chromium` → `npm test` → upload `playwright-report/` as artifact (always, so visual diffs are reviewable)
  - **Success Criteria**: Tests run automatically on PRs

- [ ] **Task 7.2**: Handle screenshot baseline updates in CI
  - **Files**: `.github/workflows/test.yml`
  - **Details**: Add a step that uploads the `test-results/` directory as an artifact when visual tests fail, so reviewers can download and compare the actual vs expected screenshots. Add a comment to the workflow explaining how to update baselines locally.
  - **Success Criteria**: Visual diff artifacts downloadable from failed CI runs

#### Checkpoint
- [ ] Tests pass in CI against live Azure SWA URL
- [ ] Visual regression failures produce downloadable diff artifacts

---

## Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Azure SWA site is down/unreachable | Low | High | Tests will fail with clear network error; retry in CI with `retries: 1` |
| Chat loads CDNs (marked.js, DOMPurify) | Medium | Medium | Use `networkidle` waits; increase timeout for CDN-dependent pages |
| Screenshot flakiness (font rendering, anti-aliasing) | High | Medium | Use `maxDiffPixelRatio: 0.01` tolerance; mask dynamic elements (cursors, timestamps); run baselines on same OS as CI (Linux) |
| Azure SWA deployment lags behind `main` | Medium | Low | Tests verify what's actually deployed, not what's in git — this is a feature |
| Chat widget auto-config on Azure SWA (has real API key) | Medium | Medium | Chat tests use fresh browser context (no stored config); chat auto-loads `chat-config.json` on SWA so setup screen may be skipped — tests must handle both flows |
| Windows vs Linux screenshot baselines differ | High | Medium | Generate baselines in CI (Linux) and commit those; local devs on Windows use `--update-snapshots` or skip visual tests |

## Open Questions

- [x] ~~Should we test against live Azure SWA or local preview?~~ → **Live Azure SWA** (`https://polite-river-06e40841e.6.azurestaticapps.net`)
- [x] ~~Visual regression screenshots or just functional?~~ → **Both**: functional tests + full-page and component-level visual regression

## Notes & Decisions

- **2026-02-16**: Plan created. Chromium-only to keep tests fast (~30s target). Can add Firefox/WebKit later.
- **2026-02-16**: Decided to test against live Azure SWA URL instead of local preview. This tests the real deployment, including auto-configured chat. No need for `webServer` config.
- **2026-02-16**: Added visual regression Phase 6 with full-page screenshots for all 9 pages + component-level screenshots for 5 key UI areas. Baselines committed to git.
- **Testing philosophy**: "Smoke loop" pattern — hit every page first, then layer interaction + visual tests. Fast feedback over exhaustive coverage.
