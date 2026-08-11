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
const kontikiPath = './kontiki2.html';

async function expectWcagAaaClean(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();

  expect(results.violations).toEqual([]);
}

async function expectResponsiveUx(page) {
  const metrics = await page.evaluate(() => {
    const interactive = [...document.querySelectorAll('a, button')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          text: element.textContent.trim() || element.getAttribute('aria-label') || element.tagName,
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      })
      .filter(({ width, height }) => width > 0 && height > 0);

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

async function scrollThrough(page, steps = 40) {
  for (let iteration = 0; iteration < steps; iteration += 1) {
    await page.evaluate((step) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: maxScroll * (step / 39), behavior: 'instant' });
    }, iteration);
    await page.waitForTimeout(15);
  }
}

test.describe('ode-to-css editorial tribute', () => {
  test('loads the living stylesheet homepage and survives the Ralph loop', async ({ page }) => {
    await page.goto(entryPath);
    await expect(page).toHaveTitle(/Ode to CSS/);
    await expect(page.getByRole('heading', { name: /web found its visual voice/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Read the voyage/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Authors with influence/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Three voices/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /language keeps learning/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /crossed another kind of cascade/i })).toBeVisible();

    await expectWcagAaaClean(page);

    const structure = await page.evaluate(() => ({
      main: document.querySelectorAll('main').length,
      nav: document.querySelectorAll('nav[aria-label]').length,
      cascadeLayers: document.querySelectorAll('.cascade-layer').length,
      timelineItems: document.querySelectorAll('.history-line li').length,
      featuredLinks: document.querySelectorAll('a[href="kontiki2.html"]').length,
      photos: document.querySelectorAll('img').length,
      scripts: document.querySelectorAll('script').length,
      h1: document.querySelectorAll('h1').length,
      unlabeledLinks: [...document.querySelectorAll('a')].filter((link) => !link.textContent.trim() && !link.getAttribute('aria-label')).length,
      skipTarget: Boolean(document.querySelector(document.querySelector('.skip-link')?.getAttribute('href') || '')),
      syntaxTokens: document.querySelectorAll('code [class^="syntax-"]').length,
      syntaxColors: new Set(
        [...document.querySelectorAll('code [class^="syntax-"]')]
          .map((token) => getComputedStyle(token).color)
      ).size,
      githubMarks: document.querySelectorAll('a[href="https://github.com/IEvangelist/ode-to-css"] .github-mark').length,
      designCredits: document.querySelectorAll('a[href="https://davidpine.dev/"]').length,
      fingerprintedStyles: /^styles\.[a-f0-9]{10}\.css$/.test(
        document.querySelector('link[rel="stylesheet"]')?.getAttribute('href') || ''
      )
    }));

    expect(structure).toEqual({
      main: 1,
      nav: 2,
      cascadeLayers: 3,
      timelineItems: 4,
      featuredLinks: 3,
      photos: 2,
      scripts: 0,
      h1: 1,
      unlabeledLinks: 0,
      skipTarget: true,
      syntaxTokens: 24,
      syntaxColors: 8,
      githubMarks: 1,
      designCredits: 1,
      fingerprintedStyles: true
    });

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

  test('loads the attributed Kon-Tiki2 photo essay', async ({ page }) => {
    await page.goto(kontikiPath);
    await expect(page).toHaveTitle(/Kon-Tiki2/);
    await expect(page.getByRole('heading', { name: /43 days/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /story remains Håkon's/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Rope, timber, and trust/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ocean became the interface/i })).toBeVisible();
    await expect(page.getByText(/responsible for all electrons onboard/i)).toBeVisible();
    await expect(page.getByText(/honorable way of arriving/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Source and credits/i })).toBeVisible();

    await expectWcagAaaClean(page);

    const story = await page.evaluate(() => ({
      main: document.querySelectorAll('main').length,
      chapters: document.querySelectorAll('.story-chapter').length,
      facts: document.querySelectorAll('.voyage-facts p').length,
      photos: document.querySelectorAll('img').length,
      creditedFigures: document.querySelectorAll('.credited-photo figcaption').length,
      canonicalLinks: [...document.querySelectorAll('a[href="https://www.wiumlie.no/img/2015/kontiki2.html"]')].length,
      remotePhotos: [...document.querySelectorAll('img')].filter((image) => image.src.startsWith('https://www.wiumlie.no/')).length,
      unlabeledImages: [...document.querySelectorAll('img')].filter((image) => !image.getAttribute('alt')).length,
      scripts: document.querySelectorAll('script').length,
      skipTarget: Boolean(document.querySelector(document.querySelector('.skip-link')?.getAttribute('href') || '')),
      githubMarks: document.querySelectorAll('a[href="https://github.com/IEvangelist/ode-to-css"] .github-mark').length,
      designCredits: document.querySelectorAll('a[href="https://davidpine.dev/"]').length
    }));

    expect(story).toEqual({
      main: 1,
      chapters: 8,
      facts: 4,
      photos: 17,
      creditedFigures: 14,
      canonicalLinks: 5,
      remotePhotos: 17,
      unlabeledImages: 0,
      scripts: 0,
      skipTarget: true,
      githubMarks: 1,
      designCredits: 1
    });

    await scrollThrough(page);

    const finalPhoto = page.locator('.landfall-crew');
    const finalPhotoLink = finalPhoto.locator(':scope > a');
    const finalPhotoCaption = finalPhoto.locator('figcaption');
    await finalPhoto.scrollIntoViewIfNeeded();
    const [figureBox, linkBox, captionBox] = await Promise.all([
      finalPhoto.boundingBox(),
      finalPhotoLink.boundingBox(),
      finalPhotoCaption.boundingBox()
    ]);
    expect(figureBox.width).toBeGreaterThan(page.viewportSize().width * .6);
    expect(linkBox.width).toBeGreaterThan(figureBox.width * .95);
    expect(captionBox.y).toBeGreaterThanOrEqual(linkBox.y + linkBox.height - 1);

    await page.screenshot({ path: 'test-results/kontiki2-photo-essay.png', fullPage: true });
  });

  test('keeps cached voyage markup aligned with current CSS', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(kontikiPath);

    const layout = await page.evaluate(() => {
      const photo = document.querySelector('.landfall-crew');
      const photoWrapper = photo.parentElement;
      photo.classList.add('shell');
      photoWrapper.replaceWith(photo);

      const footer = document.querySelector('.site-footer');
      const signoff = footer.querySelector('.footer-signoff');
      const fallbackCopy = document.createElement('p');
      fallbackCopy.textContent = 'A CSS-powered tribute to Håkon Wium Lie.';
      signoff.replaceWith(fallbackCopy);

      const figureBox = photo.getBoundingClientRect();
      const linkBox = photo.querySelector(':scope > a').getBoundingClientRect();
      const footerBox = footer.getBoundingClientRect();
      const copyBox = fallbackCopy.getBoundingClientRect();

      return {
        photoRatio: linkBox.width / figureBox.width,
        copyRatio: copyBox.width / footerBox.width,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });

    expect(layout.photoRatio).toBeGreaterThan(.95);
    expect(layout.copyRatio).toBeGreaterThan(.3);
    expect(layout.horizontalOverflow).toBeLessThanOrEqual(1);
  });

  test('provides a complete reduced-motion experience', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(entryPath);

    const motion = await page.evaluate(() => {
      const hero = getComputedStyle(document.querySelector('.hero-copy'));
      const photo = getComputedStyle(document.querySelector('.credited-photo img'));
      return {
        animationDuration: hero.animationDuration,
        transitionDuration: photo.transitionDuration,
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior
      };
    });

    expect(parseFloat(motion.animationDuration)).toBeLessThanOrEqual(0.001);
    expect(parseFloat(motion.transitionDuration)).toBeLessThanOrEqual(0.001);
    expect(motion.scrollBehavior).toBe('auto');
    await expect(page.getByRole('heading', { name: /web found its visual voice/i })).toBeVisible();
  });

  test('keeps dark mode accessible on both pages', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto(entryPath);
    await expectWcagAaaClean(page);

    await page.goto(kontikiPath);
    await expectWcagAaaClean(page);
  });

  for (const viewport of responsiveViewports) {
    test(`responsive UX and WCAG validation at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto(entryPath);
      await expect(page.getByRole('heading', { name: /web found its visual voice/i })).toBeVisible();
      await expect(page.getByRole('navigation', { name: /primary navigation/i })).toBeVisible();
      await expectResponsiveUx(page);
      await expectWcagAaaClean(page);

      await page.goto(kontikiPath);
      await expect(page.getByRole('heading', { name: /43 days/i })).toBeVisible();
      await expect(page.getByRole('navigation', { name: /primary navigation/i })).toBeVisible();
      await expectResponsiveUx(page);
      await expectWcagAaaClean(page);
    });
  }
});
