import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

// https://astro.build/config
//
// Two-tier model (ADR-011): output stays "static" by default — marketing pages
// are prerendered to HTML. The Netlify adapter enables on-demand (SSR) rendering
// for the few pages that opt out of prerendering via `export const prerender =
// false` (the Supabase-backed Tier 2 pages). Static pages stay static and free;
// only the dynamic pages run as Netlify Functions.
export default defineConfig({
  output: 'static',
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()],
  },
});
