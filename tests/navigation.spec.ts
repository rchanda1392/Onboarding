import { test, expect } from '@playwright/test';

const modules = [
  { label: 'Module 1', path: '/module-1-pipelines-and-observability/' },
  { label: 'Module 2', path: '/module-2-industry-landscape/' },
  { label: 'Module 3', path: '/module-3-google-ecosystem/' },
  { label: 'Module 4', path: '/module-4-ml-ai-infrastructure/' },
  { label: 'Module 5', path: '/module-5-ai-first-strategy/' },
  { label: 'Module 6', path: '/module-6-ai-observability/' },
  { label: 'Module 7', path: '/module-7-developer-experience/' },
];

test.describe('Sidebar navigation', () => {
  for (const mod of modules) {
    test(`sidebar link navigates to ${mod.path}`, async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Click the sidebar link matching the module path
      const link = page.locator(`a[href*="${mod.path}"]`).first();
      await expect(link).toBeVisible({ timeout: 10000 });
      await link.click();

      await expect(page).toHaveURL(new RegExp(mod.path));
      await expect(page.locator('h1')).toBeVisible();
    });
  }
});

test.describe('Dashboard card links', () => {
  test('hero "Start with Module 1" button navigates correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const heroLink = page.locator('a', { hasText: /Start with Module 1/i }).first();
    await heroLink.click();

    await expect(page).toHaveURL(/module-1/);
  });

  test('module cards link to correct pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Get all card links that point to modules
    const cardLinks = page.locator('.card-grid a[href*="module"], .sl-link-card a[href*="module"]');
    const count = await cardLinks.count();
    expect(count).toBeGreaterThan(0);

    // Test first card navigates correctly
    await cardLinks.first().click();
    await expect(page).toHaveURL(new RegExp('module-'));
  });
});

test.describe('Search', () => {
  test('search opens and returns results', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Open search dialog
    const searchButton = page.locator('button[data-open-modal]').first();
    await searchButton.click();

    // Type a search term
    const searchInput = page.locator('[type="search"], input[name="search"], dialog input').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill('pipeline');

    // Wait for results to appear
    const results = page.locator('[data-pagefind-search] a, .pagefind-ui__result a, [role="option"], mark').first();
    await expect(results).toBeVisible({ timeout: 10000 });
  });
});
