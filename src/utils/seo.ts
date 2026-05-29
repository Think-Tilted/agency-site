/**
 * SEO helpers — pure TypeScript (no markup), importable from any .astro or .ts file.
 * Demonstrates where logic/types live vs. component frontmatter.
 */

/** The studio's site-wide name, appended to page titles. */
export const SITE_NAME = "Studio";

/**
 * Build a consistent, bounded page title.
 * Pass the page-specific part; the site name is appended unless `bare` is set.
 */
export function buildTitle(pageTitle: string, options: { bare?: boolean } = {}): string {
  const trimmed = pageTitle.trim();
  if (options.bare || trimmed.length === 0) return trimmed || SITE_NAME;
  return `${trimmed} — ${SITE_NAME}`;
}

/**
 * Clamp a description to a sensible meta length (~160 chars) without cutting
 * a word in half. Returns the input unchanged if already short enough.
 */
export function clampDescription(description: string, max = 160): string {
  const text = description.trim();
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}
