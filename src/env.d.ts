/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /**
   * Absolute site origin (e.g. https://agency-tka.netlify.app), used to build
   * canonical URLs. Set in Netlify env (and locally via .env). `PUBLIC_` prefix
   * means Astro exposes it at build time. Optional — falls back when unset.
   */
  readonly PUBLIC_SITE_URL?: string;

  /**
   * Supabase project URL (e.g. https://xxxx.supabase.co). `PUBLIC_` so the
   * browser client can use it too. Tier 2 only (PRE-005 / ADR-011).
   */
  readonly PUBLIC_SUPABASE_URL: string;

  /**
   * Supabase anon/public key. Safe to expose to the browser — Row Level
   * Security enforces what it can actually do. Tier 2 only.
   */
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
