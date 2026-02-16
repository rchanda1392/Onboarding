import { test, expect } from '@playwright/test';

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
  test(`${pg.path} loads and renders`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const response = await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveTitle(new RegExp(pg.title, 'i'));

    // Filter out known third-party noise (CDN load failures in test env, etc.)
    const unexpected = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('chat-config.json'),
    );
    expect(unexpected).toHaveLength(0);
  });
}
