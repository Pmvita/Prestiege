# Prestiege

Multi-category luxury marketplace (JamesEdition-style discovery + ECR-style portfolio depth).

Categories: Real Estate, Mobility, Yachts, Jets, Watches, Jewelry, Bags, Shoes, Fashion, Art, Books, Spirits, Collectibles, Experiences.

## Quick start

```bash
npm install
npm run dev
```

| Surface | URL |
|--------|-----|
| Web (Next.js) | http://localhost:3000 |
| API (Express) | http://localhost:3001 |
| Mobile (Expo) | Expo DevTools / Metro (QR) |

Individual processes:

```bash
npm run dev:web
npm run dev:api
npm run dev:mobile
```

### API base URL

- Web: `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`)
- Mobile: `EXPO_PUBLIC_API_URL`
  - Android emulator defaults to `http://10.0.2.2:3001`
  - iOS simulator / web defaults to `http://localhost:3001`
  - Physical device: set your LAN IP, e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.10:3001`

## What was built (MVP)

### API (`backend`) — port 3001

- `GET /` · `GET /health`
- `GET /api/categories`
- `GET /api/listings` (`?category=` · `?limit=` · `?offset=`)
- `GET /api/listings/:id`
- `GET /api/collections` (`?category=`)
- `GET /api/collections/:id`

Loads mock JSON from `shared/mockData` (single source of truth) and normalizes inconsistent shapes into a common listing card (`id`, `title`, `category`, `price`, `currency`, `location`, `image`, `summary`).

### Web (`frontend`) — port 3000

- Home: brand hero, category nav, featured listings, collection previews
- `/categories/[slug]` — category browse
- `/listings/[id]` — listing detail
- `/collections` · `/collections/[id]` — portfolio browse/detail

### Mobile (`mobile`) — Expo

- Screens: Home, Category, Listing detail, Collections, Collection detail
- React Navigation native stack
- Same REST API as web

### Shared (`shared`)

- `mockData/marketplace/categories.json` — 14 categories
- `mockData/marketplace/collections.json` — seeded portfolios
- `mockData/loader.js` — CommonJS loader for the API (`prestiege-shared`)

## Structure

```
Prestiege/
  shared/mockData/   # Source of truth for listings + categories + collections
  backend/           # Express API
  frontend/          # Next.js (pages router, JSX)
  mobile/            # Expo React Native
  db/mockData/       # Mirror / archive (API prefers shared/)
  docs/              # Spec
```

## Smoke checks

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/categories
curl "http://localhost:3001/api/listings?limit=3"
curl http://localhost:3001/api/collections
```

Open http://localhost:3000 — you should see categories and real listing cards (not a title-only stub).
