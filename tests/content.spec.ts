import { test, expect } from '@playwright/test';

const modules = [
  { path: '/module-1-pipelines-and-observability/', title: 'Data Pipelines' },
  { path: '/module-2-industry-landscape/', title: 'Industry Landscape' },
  { path: '/module-3-google-ecosystem/', title: 'Google' },
  { path: '/module-4-ml-ai-infrastructure/', title: 'ML/AI' },
  { path: '/module-5-ai-first-strategy/', title: 'AI-First' },
  { path: '/module-6-ai-observability/', title: 'Observability' },
  { path: '/module-7-developer-experience/', title: 'Developer Experience' },
];

test.describe('Module content structure', () => {
  for (const mod of modules) {
    test(`${mod.path} has expected structural elements`, async ({ page }) => {
      await page.goto(mod.path, { waitUntil: 'domcontentloaded' });

      // Has an h1 heading
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      // Has "About This Module" section
      const aboutSection = page.locator('h2, h3', { hasText: /About This Module/i });
      await expect(aboutSection).toBeVisible();

      // Has at least one content section (h2 or card)
      const contentSections = page.locator('main h2');
      const count = await contentSections.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  }
});

test.describe('Glossary', () => {
  test('glossary has alphabetical sections', async ({ page }) => {
    await page.goto('/glossary/', { waitUntil: 'domcontentloaded' });

    // Should have letter headings (h2 elements)
    const h2s = page.locator('main h2');
    const count = await h2s.count();
    expect(count).toBeGreaterThanOrEqual(5); // At least 5 letter sections

    // Terms use <strong> tags for the term name
    const terms = page.locator('main strong');
    const termCount = await terms.count();
    expect(termCount).toBeGreaterThanOrEqual(10);
  });
});

test.describe('Content bundle', () => {
  test('content-bundle.json is accessible and valid', async ({ request }) => {
    const response = await request.get('/content-bundle.json');
    expect(response.status()).toBe(200);

    const bundle = await response.json();
    expect(Array.isArray(bundle)).toBe(true);
    expect(bundle.length).toBeGreaterThanOrEqual(7);

    // Each entry should have title and sections
    for (const entry of bundle) {
      expect(entry).toHaveProperty('title');
      expect(entry).toHaveProperty('sections');
      expect(Array.isArray(entry.sections)).toBe(true);
      expect(entry.sections.length).toBeGreaterThan(0);
    }
  });
});
