<p align="center">
  <img src="public/pokechaser-logo-light-mode.png" alt="Poke Chaser" width="320" />
</p>

<h1 align="center">Poke Chaser</h1>

<p align="center">
  A full-stack Pokémon TCG browser and collection manager — browse sets, track owned cards, and organize them in visual binders.
</p>

<p align="center">
  <a href="https://github.com/Thee-Dust/poke-chaser-react/actions/workflows/ci.yml"><img src="https://github.com/Thee-Dust/poke-chaser-react/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
</p>

## Features

### Browse & discover

- Browse all Pokémon TCG sets with server-side sort (release date, A–Z, Z–A) and pagination
- Set detail pages with sortable card grids — number, name, price, rarity
- Card detail — attacks, weaknesses, HP, and direct TCGPlayer / eBay buy links
- Search the full catalog by card name

### Collections *(authenticated)*

- Create and manage multiple named collections
- Track quantity owned, market value, total spent, and gain/loss per collection
- Purchase history per card — date, price paid, notes
- Remove cards with quantity stepper and purchase-aware partial removal

### Binders *(authenticated)*

- Build visual binders with configurable page layouts (sizes loaded from the API)
- Drag cards from the sidebar or between slots; open card detail from any filled slot
- Name binders and individual pages
- Sidebar page navigation with a spread view that mimics a physical binder

### UX polish

- Light and dark theme with instant toggle, persisted to `localStorage`
- Skeleton loading states with shimmer animation on set/card grids and collection stats
- Responsive layout — search bar stacks on small screens
- Keyboard accessible — focus rings, modal escape handling, ARIA labels on interactive controls

## Tech stack

| Layer | Tools |
|-------|--------|
| UI | React 19, TypeScript, React Router v7 |
| Styling | Colocated CSS (BEM), CSS custom properties, `[data-theme]` light/dark |
| Build | Vite |
| Data | REST API via typed `dataProvider` — Django backend |
| Auth | Session auth with CSRF handling |

## Architecture highlights

- **Single data layer** — All API calls go through [`src/providers/dataProvider.ts`](src/providers/dataProvider.ts). Pages use `useData()` and never call `fetch` directly; API field names stay snake_case end-to-end.
- **Design tokens** — Theme colors live in [`src/index.css`](src/index.css) as `var(--*)` custom properties. Switching themes is a `data-theme` attribute change — no runtime style recalculation in components.
- **Loading UX** — Skeleton tiles mirror real tile layout (two-tone background + shimmer overlay) so grids do not jump when data arrives.
- **Protected routes** — Collections and binders sit behind [`ProtectedRoute`](src/routes/ProtectedRoute.tsx) with auth context; unauthenticated users are redirected to log in.

## Getting started

**Prerequisites:** Node.js 18+, npm, and the Poke Chaser Django API running (default port `8000`).

```bash
git clone <repo-url>
cd poke-chaser-react
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

### Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL of the Django API (default `http://localhost:8000`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |

## CI

Pull requests and pushes to `main` run the [CI workflow](.github/workflows/ci.yml): `npm ci` and `npm run build` (TypeScript + Vite). Failed builds block merge until fixed.

## Deploying

Production deploys run via GitHub Actions on version tags (`v*.*.*`), matching the backend release pattern.

**GitHub repository variables** (Settings → Secrets and variables → Actions → Variables):

| Variable | Example |
|----------|---------|
| `AWS_DEPLOY_ROLE_ARN` | IAM role from backend Terraform output `github_frontend_deploy_role_arn` |
| `S3_BUCKET` | `poke-chaser-frontend-prod` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID from Terraform |
| `AWS_REGION` | `us-east-1` |
| `VITE_API_BASE_URL` | `https://api.pokechaser.com` |

Release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow builds with `VITE_API_BASE_URL`, syncs `dist/` to S3, and invalidates the CloudFront cache.

## Project structure

```
src/
  pages/          Route screens (Dashboard, SetDetail, Collection, BinderBuilder, …)
  components/     Presentational UI with colocated CSS
  providers/      dataProvider + React context
  context/        Auth and theme
  routes/         AppRoutes, ProtectedRoute
  api/            Shared TypeScript types (mirror API JSON)
  utils/          fetch helpers, URL builder
public/           Static assets (logos, favicon)
```
