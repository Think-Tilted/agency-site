# Security model

This is a Tier 2 site: a static marketing front end plus a small Supabase-backed
content area (the `events` feature). Most pages are prerendered HTML; only the
pages that touch the database opt into SSR via `export const prerender = false`.

The security boundary is **Postgres Row Level Security (RLS)** — not the UI. The
UI redirects are a convenience; the database is what actually enforces who can
read and write.

## Roles

| Role            | Who                                   | Can read events | Can write events |
| --------------- | ------------------------------------- | --------------- | ---------------- |
| `anon`          | Any visitor (uses the public anon key)| ✅               | ❌                |
| `authenticated` | A logged-in user                      | ✅               | ❌ unless admin   |
| admin           | Email listed in `public.admins`       | ✅               | ✅                |

Being logged in is **not** the same as being an admin. The write policies call
`public.is_admin()`, which checks the caller's auth email against the `admins`
allowlist.

## History — why migration 0002 exists

The original `0001_events.sql` granted write to **any** `authenticated` user, and
auth allowed open self-signup. Together that meant any visitor could register and
edit events. `0002_admin_rls.sql` closes that hole:

- Adds the `public.admins` allowlist + `is_admin()` and replaces the open write
  policies with admin-gated ones.
- Backfills `admins` from existing `auth.users` — **review that table after
  pushing** (`select * from public.admins;`) and remove anyone who shouldn't be
  an admin, since signup was previously open.

`config.toml` was also hardened: public signup disabled, email confirmation
required, secure password change, and a 12-char minimum password length.

## Keys

- **Anon key** (`PUBLIC_SUPABASE_ANON_KEY`): safe to ship to the browser. It can
  only do what RLS allows for `anon`/`authenticated`.
- **Service-role key**: bypasses RLS entirely. Never committed, never shipped to
  the browser. Read it from the Supabase dashboard if you ever need it.

## Auth in the app

- Always authorize with `supabase.auth.getUser()` (validates the JWT), never
  `getSession()` (trusts unverified cookie state).
- The login form returns a generic "invalid email or password" to avoid account
  enumeration.
- Admin mutations use Post/Redirect/Get so a refresh never resubmits a write.

## Adding / removing admins

```sql
insert into public.admins (email) values ('new-admin@example.com');
delete from public.admins where email = 'old-admin@example.com';
```

Create the matching auth user from the Supabase dashboard (Authentication →
Users). Since self-signup is disabled, that's the only way to add an account.

## Lost the admin password?

It's never stored in retrievable form (Supabase keeps only a one-way hash). Reset
it from the Supabase dashboard → Authentication → Users → "Send recovery", or set
a new password there directly.
