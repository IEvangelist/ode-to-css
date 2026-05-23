# ode-to-css

A static storytelling tribute to Håkon Wium Lie, creator of CSS. The site is intentionally small: semantic HTML, expressive CSS, no runtime JavaScript, and a Playwright-powered Ralph loop that scrolls and screenshots the experience 100 times.

View the deployed site at <https://IEvangelist.github.io/ode-to-hakon-wium-lie/>. If the repository itself is renamed to `ode-to-css`, GitHub Pages will move to <https://IEvangelist.github.io/ode-to-css/>.

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

Run the same accessibility-first validation against a deployed URL with:

```bash
DEPLOYED_BASE_URL=https://IEvangelist.github.io/ode-to-hakon-wium-lie/ npm run test:deployed
```

## Deployment

The repository includes a GitHub Actions workflow that validates the site, deploys the static `dist` output to GitHub Pages on pushes to `main`, and then validates the deployed site. Playwright checks include WCAG AAA-oriented axe rules, responsive UX coverage, target-size checks, and the 100-step Ralph loop.
