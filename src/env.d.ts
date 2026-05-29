/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /**
   * Absolute site origin (e.g. https://agency-tka.netlify.app), used to build
   * canonical URLs. Set in Netlify env (and locally via .env). `PUBLIC_` prefix
   * means Astro exposes it at build time. Optional — falls back when unset.
   */
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
