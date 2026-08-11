# ode-to-css

A static editorial tribute to Håkon Wium Lie, creator of CSS. The site uses semantic HTML, cascade-layered modern CSS, real Kon-Tiki2 expedition photography linked from Håkon's canonical archive, no runtime JavaScript, and Playwright validation.

View the deployed site at <https://IEvangelist.github.io/ode-to-css/>.

## Local development

```bash
npm ci
npm run playwright:install
npm run ralph
```

Build and preview the site with:

```bash
npm run preview
```

The build combines the native CSS modules in `styles/`, copies the Recursive variable font, and emits the deployable `dist` directory.

## Photography

Voyage photographs remain hosted in Håkon Wium Lie's original Kon-Tiki2 archive and are not copied into this repository. Every displayed photograph links to its canonical file and includes a visible archive credit. See `assets/photo-credits.json`.

Run the same accessibility-first validation against a deployed URL with:

```bash
DEPLOYED_BASE_URL=https://IEvangelist.github.io/ode-to-css/ npm run test:deployed
```

## Deployment

The repository includes a GitHub Actions workflow that validates the site, deploys the static `dist` output to GitHub Pages on pushes to `main`, and then validates the deployed site. Playwright checks include WCAG AAA-oriented axe rules, responsive UX coverage, target-size checks, and the 100-step Ralph loop.
