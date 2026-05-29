# Agency Site

Marketing site for the studio, built with Astro + Tailwind + TypeScript.

## Stack

- **Astro** — static-first framework
- **Tailwind v4** — styling (CSS-first config in `src/styles/global.css`)
- **TypeScript** — `strictest` config

## Develop

```bash
npm install
npm run dev      # local dev server
npm run check    # type check (must pass before deploy)
npm run build    # production build → dist/
```

## Deploy

Auto-deploys to Netlify on push to `main`. Pull requests get deploy previews.
Build settings live in `netlify.toml`. Node version is pinned there to match
local (Astro v6 requires Node >= 22.12.0).
