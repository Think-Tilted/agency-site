# Agency Site

Marketing site for the studio, built with Astro + Tailwind + TypeScript.

## Stack

- **Astro** — static-first framework (Netlify adapter for on-demand pages)
- **Tailwind v4** — styling (CSS-first config in `src/styles/global.css`)
- **TypeScript** — `strictest` config
- **Supabase** — Postgres + Auth for the dynamic (Tier 2) pages

## Two-tier content model (ADR-011)

Most pages are **static** (prerendered HTML). A few pages opt into **on-demand
SSR** by exporting `prerender = false`, and read/write **Supabase**:

- `/events` — public, reads live from the DB.
- `/login` — email/password sign-in (Supabase Auth, cookie session).
- `/admin/events` — protected editor (add/delete), redirects to `/login` if
  signed out.

Schema lives in `supabase/migrations/` and is applied with `supabase db push`.
Row Level Security: public read, authenticated write.

## Environment

Copy `.env.example` to `.env` and fill in:

- `PUBLIC_SITE_URL` — canonical origin.
- `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` — anon-safe (RLS enforces
  access). Find via `supabase projects api-keys` or the dashboard.

In production the same vars must exist on Netlify (the gitignored `.env` never
ships, so without this the SSR pages 500 on deploy). Set them via the CLI — this
is the repeatable recipe the future scaffold script will run:

```bash
# Auth is via Personal Access Tokens in env vars (scriptable, CI-friendly):
#   SUPABASE_ACCESS_TOKEN  — Supabase CLI
#   NETLIFY_AUTH_TOKEN     — Netlify CLI

npx netlify link --name agency-tka            # link this dir to the Netlify site
npx netlify env:set PUBLIC_SUPABASE_URL "https://<ref>.supabase.co"
npx netlify env:set PUBLIC_SUPABASE_ANON_KEY "<anon-key>"
# Env var changes require a redeploy to take effect.
```

## Develop

```bash
npm install
npm run dev      # local dev server
npm run check    # type check (must pass before deploy)
npm run build    # production build → dist/

supabase db push # apply migrations to the linked Supabase project
```

## Deploy

Deploys are **release-triggered, not push-triggered** — to conserve Netlify build
minutes, pushing to `main` does **not** build the site. A production deploy happens
only when a GitHub Release is published, which runs
`.github/workflows/deploy-on-release.yml` and pings the Netlify build hook
(stored in the `NETLIFY_BUILD_HOOK_URL` repo secret).

```bash
# Ship a new production deploy:
gh release create v1.0.1 --generate-notes

# Or trigger manually without a release (Actions tab → "Deploy on release" → Run),
# or from the CLI:
gh workflow run "Deploy on release" --repo Think-Tilted/agency-site
```

Push freely to `main` for work-in-progress; nothing builds until you cut a release.
Build settings live in `netlify.toml`. Node version is pinned there to match local
(Astro v6 requires Node >= 22.12.0).
