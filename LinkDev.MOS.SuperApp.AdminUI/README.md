# Unified Admin Portal

**لوحة الإدارة الموحدة**

A generic Angular admin dashboard template with Arabic/English support, RTL/LTR, mock services, and localStorage persistence. No real organization names or branding are used in this project.

## Privacy Note

This is a sensitive template project. All names, systems, and assets are placeholders only:

- Project display name: **Unified Admin Portal** / **لوحة الإدارة الموحدة**
- External account system: **Central Account Directory** / **دليل الحسابات المركزي**
- No real organization names, logos, or branding

## Requirements

- Node.js 18.19+ or 20.11+
- npm 8+

## Install

```bash
npm install
```

## Run

```bash
npm start
```

Open `http://localhost:4200`. Mock login accepts any email/password.

## Build

```bash
npm run build
```

Output: `dist/unified-admin-portal`

## Replace Branding Assets

All image assets are **placeholders** and can be replaced with your organization's branding later.

| Asset | Path | Usage |
|-------|------|-------|
| Logo (placeholder) | `src/assets/images/logo.svg` | Login page, sidebar, route navigation loader |
| Main illustration | `src/assets/images/main-illustration.svg` | Login & dashboard welcome banner |
| Avatar placeholder | `src/assets/images/avatar-placeholder.svg` | Topbar user avatar |
| Empty state illustration | `src/assets/images/empty-state.svg` | Empty list states |

## UI Components

Reusable shared components under `src/app/shared/components/`:

| Component | Path | Purpose |
|-----------|------|---------|
| App Loader | `app-loader/` | Top progress bar + fullscreen overlay during route navigation (uses placeholder logo) |
| Skeleton | `skeleton/` | Shimmer loading placeholders for cards, tables, and detail pages |
| Language Switcher | `language-switcher/` | Globe dropdown toggle (العربية / English), persists to `localStorage` |

The route loader listens to Angular Router events (`NavigationStart`, `NavigationEnd`, `NavigationCancel`, `NavigationError`) and is wired in the admin layout.

## Theme Colors

Configure in `src/styles/_variables.scss`:

```scss
:root {
  --primary-color: #01AA4E;
  --primary-hover: #009846;
  /* ... */
}
```

## Translations

- Arabic: `src/assets/i18n/ar.json`
- English: `src/assets/i18n/en.json`

Language is detected from the browser (Arabic default if browser is Arabic), saved in `localStorage`, and applied with RTL/LTR document direction.

Use translation keys in templates:

```html
{{ 'common.save' | translate }}
```

## Mock Services → Real APIs

All data services live under `src/app/core/services/` and use `localStorage`. Replace them with HTTP-based services when connecting to real APIs:

| Service | Purpose |
|---------|---------|
| `mock-auth.service.ts` | Authentication |
| `mock-directory.service.ts` | Central Account Directory search |
| `users.service.ts` | Dashboard users & permissions |
| `service-pages.service.ts` | Service intro pages, systems, services |
| `quick-links.service.ts` | Quick links management |
| `employee-news.service.ts` | Employee news |
| `audit-log.service.ts` | Audit trail |

Keep the same interfaces in `src/app/core/models/` so components require minimal changes.

## Features

- Dashboard with summary cards, recent activity, quick actions
- Users & permissions (directory search, permission matrix)
- Service intro pages (draft/publish, FAQ, documents)
- Quick links (drag-and-drop reorder via Angular CDK)
- Employee news (categories, publish/unpublish, reactions)
- Audit log
- Settings & language switcher

## Project Structure

```
src/app/
  core/          models, services, guards, constants
  shared/        reusable components, pipes
  layouts/       admin layout
  features/      lazy-loaded feature routes
  assets/i18n/   translation JSON files
  styles/        SCSS variables
```

## License

Private template — replace branding and connect real APIs before production use.
