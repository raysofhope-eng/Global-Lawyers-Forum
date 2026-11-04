# Frontend

Independent Next.js / React / TypeScript application. Install and run commands directly from this directory; no parent-folder package is required. The backend is a separate project.

```sh
npm ci
# Copy .env.example to .env for a fresh checkout.
npm run dev
npm run build
npm start
```

## Configuration

| Variable           | Purpose                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`         | Public canonical origin. Locally `http://localhost:3000`; production must use the existing live domain. Read at build time. |
| `API_INTERNAL_URL` | Private API origin, normally `http://127.0.0.1:4000`. Used by the Next.js rewrite.                                          |

There are no public client-side secrets. API calls always use same-origin `/api`; session cookies are HTTP-only and never saved to localStorage. Only the colour theme is stored locally.

## Architecture

- `src/app/(public)`: seven pre-rendered public routes and shared public shell.
- `src/app/admin`: private registrar UI. No applicant data is embedded during build; the authenticated API enforces access.
- `src/components/site`: reusable navigation, footer, banner, breadcrumb schema, CTA, chapter card, form and visual effects. The original CSS and image assets are retained.
- `src/content`: metadata and chapter data. Other page content is server-rendered JSX.
- `src/hooks`: React Query keys, cached lists, application details and status mutations.
- `src/lib/api.ts`: one fetch client, typed errors, JSON/FormData handling, and same-origin credentials.
- `src/contracts`: local API DTOs/validation. The backend owns its own matching contract: neither repository imports the other. Coordinate breaking API changes or publish a versioned schema package later.

React Query lists have a one-minute stale time and refresh on focus. Private application detail queries have zero retention after unmount. Signing out removes application queries. Submissions are not automatically retried.

## SEO and URL migration

Each page has its own title, description, canonical, Open Graph and Twitter metadata. Shared organization structured data and page breadcrumbs describe existing facts. Sitemap and robots routes are generated; admin/API paths are excluded. Legacy `.html` URLs and old project-prefixed paths receive 308 redirects, preserving query parameters. Domain changes also require redirects at the old host and Search Console follow-up.

## Checks

```sh
npm run typecheck
npm run build
npm run test:e2e
```

Browser tests use installed Google Chrome at desktop and mobile widths. They check pages, layout overflow, metadata, redirects, menus, theme persistence, form validation, upload/submission UI, newsletter UI and admin review/logout. UI API responses are mocked for deterministic tests; the backend separately tests real HTTP requests against Docker MySQL.

The Google Fonts stylesheet matches the original typography and uses `display=swap`; browsers without external font access fall back to the original fallback fonts.
