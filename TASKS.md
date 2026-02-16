# Tasks

Generated from: EXECUTION_PLAN.md (Playwright E2E Testing Loop)
Created: 2026-02-16
Last Updated: 2026-02-16

## Task List

### Phase 1: Scaffold Playwright Infrastructure
- [x] Task 1.1: Install Playwright as dev dependency
- [x] Task 1.2: Create playwright.config.ts
- [x] Task 1.3: Add npm scripts for testing
- [x] Task 1.4: Update .gitignore for test artifacts

### Phase 2: Smoke Loop — Every Page Renders
- [x] Task 2.1: Create data-driven smoke test for all 9 pages
- [x] Task 2.2: Assert no console errors on any page

### Phase 3: Navigation & Sidebar Tests
- [x] Task 3.1: Test sidebar navigation links
- [x] Task 3.2: Test Dashboard card links
- [x] Task 3.3: Test Starlight search

### Phase 4: Chat Widget Tests
- [x] Task 4.1: Test chat widget renders on every page
- [x] Task 4.2: Test chat setup form interaction
- [x] Task 4.3: Test chat send + error handling

### Phase 5: Content Integrity Tests
- [x] Task 5.1: Verify module structural elements
- [x] Task 5.2: Verify glossary alphabetical sections
- [x] Task 5.3: Verify content-bundle.json accessible and valid

### Phase 6: Visual Regression Screenshots
- [x] Task 6.1: Add full-page screenshot baselines for all 9 pages
- [x] Task 6.2: Add component-level screenshot tests
- [x] Task 6.3: Document visual regression workflow

### Phase 7: CI Integration
- [x] Task 7.1: Add Playwright GitHub Actions workflow
- [x] Task 7.2: Handle screenshot baseline updates in CI

## Progress

Total: 18 tasks
Completed: 18
Remaining: 0

Status: ALL TASKS COMPLETE

## Log

- 2026-02-16: Tasks extracted from execution plan
- 2026-02-16: Phase 1 complete — Playwright installed, config created, npm scripts added, .gitignore updated
- 2026-02-16: Phase 2 complete — 9/9 smoke tests passing (all pages render, no console errors)
- 2026-02-16: Phase 3 complete — sidebar nav, card links, hero button, search all verified
- 2026-02-16: Phase 4 complete — chat widget present on all pages, setup form works, send + error handling verified
- 2026-02-16: Phase 5 complete — module structure, glossary, content-bundle.json all validated
- 2026-02-16: Phase 6 complete — 14 screenshot baselines generated (9 full-page + 5 component)
- 2026-02-16: Phase 7 complete — GitHub Actions workflow created with artifact uploads
- 2026-02-16: Full suite: 53 tests, 53 passed, 15.1s
