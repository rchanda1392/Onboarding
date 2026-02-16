import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', name: 'dashboard' },
  { path: '/module-1-pipelines-and-observability/', name: 'module-1' },
  { path: '/module-2-industry-landscape/', name: 'module-2' },
  { path: '/module-3-google-ecosystem/', name: 'module-3' },
  { path: '/module-4-ml-ai-infrastructure/', name: 'module-4' },
  { path: '/module-5-ai-first-strategy/', name: 'module-5' },
  { path: '/module-6-ai-observability/', name: 'module-6' },
  { path: '/module-7-developer-experience/', name: 'module-7' },
  { path: '/glossary/', name: 'glossary' },
];

test.describe('Full-page visual regression', () => {
  for (const pg of pages) {
    test(`${pg.name} full-page screenshot`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'networkidle' });

      // Hide dynamic elements that cause flaky diffs
      await page.addStyleTag({
        content: `
          /* Hide blinking cursors and animations */
          *, *::before, *::after {
            caret-color: transparent !important;
            animation: none !important;
            transition: none !important;
          }
        `,
      });

      // Wait for any remaining layout shifts
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`${pg.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});

test.describe('Component-level visual regression', () => {
  test('dashboard hero section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
    });

    const hero = page.locator('.hero, [class*="hero"], header .sl-flex').first();
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot('hero.png');
  });

  test('dashboard card grid', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
    });

    const cardGrid = page.locator('.card-grid, [class*="CardGrid"]').first();
    await expect(cardGrid).toBeVisible();
    await expect(cardGrid).toHaveScreenshot('card-grid.png');
  });

  test('sidebar navigation panel', async ({ page }) => {
    // Use a module page (not splash/dashboard) since sidebar is always visible there
    await page.goto('/module-1-pipelines-and-observability/', { waitUntil: 'networkidle' });
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
    });

    // Starlight sidebar uses different selectors — try multiple
    const sidebar = page.locator('#starlight__sidebar, [id*="sidebar"], nav ul').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    await expect(sidebar).toHaveScreenshot('sidebar-nav.png');
  });

  test('chat widget setup screen', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
    });

    const chatPanel = page.locator('#chat-sidebar, [id*="chat"], [class*="chat-panel"]').first();
    await expect(chatPanel).toBeVisible({ timeout: 10000 });
    await expect(chatPanel).toHaveScreenshot('chat-setup.png');
  });

  test('chat widget after setup', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
    });

    const chatPanel = page.locator('#chat-sidebar, [id*="chat"], [class*="chat-panel"]').first();
    await expect(chatPanel).toBeVisible({ timeout: 10000 });

    // Try to get past setup screen if present
    const setupInput = page.locator('input[placeholder*="endpoint" i], input[placeholder*="uri" i]').first();
    const isSetupVisible = await setupInput.isVisible().catch(() => false);

    if (isSetupVisible) {
      await setupInput.fill('https://dummy.openai.azure.com/openai/deployments/gpt/responses');
      const apiKeyInput = page.locator('input[placeholder*="key" i], input[type="password"]').first();
      await apiKeyInput.fill('dummy-api-key-12345');
      const submitBtn = page.locator('button', { hasText: /save|start|connect|submit/i }).first();
      await submitBtn.click();
      await page.waitForTimeout(500);
    }

    await expect(chatPanel).toHaveScreenshot('chat-interface.png');
  });
});
