# ode-to-css

A static storytelling tribute to Håkon Wium Lie, creator of CSS. The site is intentionally small: semantic HTML, expressive CSS, no runtime JavaScript, and a Playwright-powered Ralph loop that scrolls and screenshots the experience 100 times.

## Local development

```bash
npm ci
npm run playwright:install
npm run ralph
npm run build
```

Preview the site with:

```bash
npm run preview
```

## Deployment

The repository includes a GitHub Actions workflow that validates the site and deploys the static `dist` output to GitHub Pages on pushes to `main`.
