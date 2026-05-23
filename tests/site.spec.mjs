import { test, expect } from '@playwright/test';

test.describe('ode-to-css storytelling site', () => {
  test('loads core story, remains accessible, and survives a 100-step Ralph loop', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ode to CSS/);
    await expect(page.getByRole('heading', { name: /cascade becomes a current/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Begin the voyage/i })).toBeVisible();

    const violations = await page.evaluate(() => {
      const unlabeledLinks = [...document.querySelectorAll('a')].filter((link) => !link.textContent.trim() && !link.getAttribute('aria-label'));
      const headingLevels = [...document.querySelectorAll('h1,h2,h3')].map((heading) => Number(heading.tagName.slice(1)));
      return { unlabeledLinks: unlabeledLinks.length, headingLevels };
    });

    expect(violations.unlabeledLinks).toBe(0);
    expect(violations.headingLevels[0]).toBe(1);

    const viewportHeights = [720, 820, 920, 1020];
    for (let iteration = 0; iteration < 100; iteration += 1) {
      await page.setViewportSize({ width: 1280 + (iteration % 5) * 24, height: viewportHeights[iteration % viewportHeights.length] });
      await page.evaluate((step) => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: maxScroll * (step / 99), behavior: 'instant' });
      }, iteration);
      await page.waitForTimeout(10);
      await expect(page.locator('body')).toBeVisible();
    }

    await page.screenshot({ path: 'test-results/ode-to-css-ralph-loop.png', fullPage: true });
  });
});
