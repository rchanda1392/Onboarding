# Playwright E2E Tests

End-to-end tests for the Onboarding Guide site, running against the live Azure SWA deployment.

## Running Tests

```bash
npm test              # Run all tests (headless)
npm run test:ui       # Interactive UI mode with time-travel debugging
npx playwright test --headed   # Watch browser execute tests
```

## Test Files

| File | Tests | What it covers |
|------|-------|----------------|
| `smoke.spec.ts` | 9 | Every page loads (HTTP 200, `<main>` visible, no console errors) |
| `navigation.spec.ts` | 10 | Sidebar links, dashboard cards, hero button, Starlight search |
| `chat.spec.ts` | 11 | Chat widget presence on all pages, setup form, message send + error handling |
| `content.spec.ts` | 9 | Module structural elements, glossary sections, content-bundle.json validity |
| `visual.spec.ts` | 14 | Full-page screenshots (9 pages) + component screenshots (5 UI areas) |

## Visual Regression

Screenshots are stored in `tests/__screenshots__/` and committed to git. They serve as baselines — any UI change that alters the screenshots will fail the test.

### Updating baselines after intentional UI changes

```bash
npx playwright test tests/visual.spec.ts --update-snapshots
```

Then review the updated screenshots and commit them.

### Reviewing visual diffs

```bash
npx playwright show-report
```

The HTML report shows side-by-side diffs of expected vs actual screenshots.

### Tolerance

Configured with `maxDiffPixelRatio: 0.01` (1% pixel difference allowed) to handle minor rendering variations across environments.

### Platform note

Screenshot baselines are platform-specific (font rendering differs between Windows/macOS/Linux). If baselines were generated on Windows but CI runs on Linux, regenerate baselines in CI and commit those.
