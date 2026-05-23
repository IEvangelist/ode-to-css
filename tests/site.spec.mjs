import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const responsiveViewports = [
  { name: 'small phone', width: 360, height: 740 },
  { name: 'large phone', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 820 },
  { name: 'wide desktop', width: 1440, height: 1024 }
];
const entryPath = './';

async function expectWcagAaaClean(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();

  expect(results.violations).toEqual([]);
}

async function expectResponsiveUx(page) {
  const metrics = await page.evaluate(() => {
    const interactive = [...document.querySelectorAll('a, button')].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        text: element.textContent.trim() || element.getAttribute('aria-label') || element.tagName,
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });

    return {
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      interactive
    };
  });

  expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
  for (const target of metrics.interactive) {
    expect.soft(target.width, `${target.text} target width`).toBeGreaterThanOrEqual(44);
    expect.soft(target.height, `${target.text} target height`).toBeGreaterThanOrEqual(44);
  }
}

test.describe('ode-to-css storytelling site', () => {
  test('loads core story, passes WCAG AAA-oriented checks, and survives a 100-step Ralph loop', async ({ page }) => {
    await page.goto(entryPath);
    await expect(page).toHaveTitle(/Ode to CSS/);
    await expect(page.getByRole('heading', { name: /cascade becomes a current/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Begin the voyage/i })).toBeVisible();

    await expectWcagAaaClean(page);

    const landmarks = await page.evaluate(() => ({
      main: document.querySelectorAll('main').length,
      nav: document.querySelectorAll('nav[aria-label]').length,
      h1: document.querySelectorAll('h1').length,
      unlabeledLinks: [...document.querySelectorAll('a')].filter((link) => !link.textContent.trim() && !link.getAttribute('aria-label')).length,
      skipTarget: Boolean(document.querySelector(document.querySelector('.skip-link')?.getAttribute('href') || ''))
    }));

    expect(landmarks).toEqual({ main: 1, nav: 1, h1: 1, unlabeledLinks: 0, skipTarget: true });

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

  for (const viewport of responsiveViewports) {
    test(`responsive UX and WCAG AAA-oriented validation at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(entryPath);
      await expect(page.getByRole('heading', { name: /cascade becomes a current/i })).toBeVisible();
      await expect(page.getByRole('navigation', { name: /primary navigation/i })).toBeVisible();
      await expectResponsiveUx(page);
      await expectWcagAaaClean(page);
    });
  }
});
