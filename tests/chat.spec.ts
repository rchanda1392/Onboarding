import { test, expect } from '@playwright/test';

const pages = [
  '/',
  '/module-1-pipelines-and-observability/',
  '/module-2-industry-landscape/',
  '/module-3-google-ecosystem/',
  '/module-4-ml-ai-infrastructure/',
  '/module-5-ai-first-strategy/',
  '/module-6-ai-observability/',
  '/module-7-developer-experience/',
  '/glossary/',
];

test.describe('Chat widget presence', () => {
  for (const path of pages) {
    test(`chat widget visible on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await expect(page.locator('#chat-sidebar')).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe('Chat setup and interaction', () => {
  test('chat is configured or shows setup form', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('#chat-sidebar')).toBeVisible({ timeout: 10000 });

    // On Azure SWA: chat-config.json auto-configures, setup is removed, composer visible
    // On GitHub Pages: setup screen with endpoint URI + API key inputs visible
    const composer = page.locator('#chat-composer');
    const setup = page.locator('#chat-setup');

    const isComposerVisible = await composer.isVisible().catch(() => false);
    const isSetupVisible = await setup.isVisible().catch(() => false);

    // One of these must be true
    expect(isComposerVisible || isSetupVisible).toBe(true);

    if (isSetupVisible) {
      // GitHub Pages: fill dummy credentials and submit
      await page.locator('#chat-endpoint-uri').fill('https://dummy.openai.azure.com/openai/deployments/gpt/responses');
      await page.locator('#chat-key-input').fill('dummy-api-key-12345');
      await page.locator('#chat-save-key').click();

      // Should transition to chat interface
      await expect(page.locator('#chat-composer')).toBeVisible({ timeout: 5000 });
    }

    // Composer should now be visible in either flow
    await expect(page.locator('#chat-input')).toBeVisible();
  });

  test('chat sends message and handles API error gracefully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('#chat-sidebar')).toBeVisible({ timeout: 10000 });

    // Get past setup if needed (GitHub Pages flow)
    const isSetupVisible = await page.locator('#chat-setup').isVisible().catch(() => false);
    if (isSetupVisible) {
      await page.locator('#chat-endpoint-uri').fill('https://dummy.openai.azure.com/openai/deployments/gpt/responses');
      await page.locator('#chat-key-input').fill('dummy-api-key-12345');
      await page.locator('#chat-save-key').click();
      await expect(page.locator('#chat-composer')).toBeVisible({ timeout: 5000 });
    }

    // Type and send a message
    await page.locator('#chat-input').fill('What is data observability?');
    await page.locator('#chat-send-btn').click();

    // User message should appear in the chat
    const userMsg = page.locator('#chat-msg-list .chat-row', { hasText: 'data observability' });
    await expect(userMsg).toBeVisible({ timeout: 5000 });

    // Wait for API response (will error with dummy creds, or succeed with real Azure config)
    // Either way, the page should not crash
    await page.waitForTimeout(5000);
    await expect(page.locator('#chat-sidebar')).toBeVisible();

    // Check for either a bot response or an error message (both are acceptable)
    const botOrError = page.locator('#chat-msg-list .chat-row:nth-child(n+3), .chat-error');
    await expect(botOrError.first()).toBeVisible({ timeout: 10000 });
  });
});
