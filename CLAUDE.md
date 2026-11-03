# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photography portfolio web app: React + TypeScript frontend, FastAPI backend, PostgreSQL database, AWS S3 for photo storage, Supabase Auth for the admin login, and ImageKit for image optimization. All services run via Docker Compose behind an Nginx reverse proxy.

## Development Commands

### Running the full stack

```bash
docker-compose up          # Start all services at http://localhost:3005
docker-compose up --build  # Rebuild containers and start
```

### Frontend (client/)

```bash
cd client
bun install
bun run dev       # Vite dev server with HMR
bun run build     # Typecheck + Vite production build
bun run preview   # Preview production build
bun run typecheck # tsc (TypeScript 7) over src and the Vite/Vitest configs
bun run test      # Vitest
bun run lint      # oxlint (lint:fix to auto-fix)
bun run format    # oxfmt (format:check to verify only)
bun run check     # typecheck + lint + format:check
```

The client uses Bun as its package manager (`bun.lock`; there is no `package-lock.json`). Tests run on Vitest via `bun run test`. Plain `bun test` runs Bun's own test runner and is not the project's test command. The client Docker image is `oven/bun:1.4.2-alpine`, pinned to match the `packageManager` version in `package.json`; bump both together.

### Backend (api/)

```bash
cd api
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 4000
```

### Backend tests

```bash
cd api
pytest                        # Run all tests
pytest tests/test_auth.py     # Run a specific test file
pytest tests/test_auth.py -k "test_name"  # Run a single test
```

### Linting and formatting (frontend)

The client uses oxlint (`client/.oxlintrc.json`, type-aware rules enabled) and oxfmt (`client/.oxfmtrc.json`, which also sorts imports and Tailwind classes). ESLint and Prettier are not used.

```bash
cd client
bun run lint
bun run format
```

A lefthook pre-commit hook (`lefthook.yml` at the repo root) runs oxlint and `oxfmt --check` on staged client files. It is installed automatically by `bun install` in `client/`.

## Architecture

### Request Flow

Client (port 3000) and API (port 4000) are behind an Nginx reverse proxy (port 3005). Nginx routes `/` to the client and `/api/` to the backend (stripping the `/api` prefix). Max upload size is 20MB.

### Backend (api/src/)

- **main.py** - FastAPI app init, exception handlers, CORS (origins from `CORS_ORIGINS`), router mounting, `GET /healthz`
- **config.py** - Pydantic `BaseSettings` loading from `.env`
- **database.py** - SQLAlchemy 2.0 engine (`pool_pre_ping` for the Supabase pooler), session factory, `Base`, and the `get_db` dependency (use the `DbSession` annotation in routes). Queries use `select()`, not the legacy `db.query()`
- **models.py** - Single `Photo` ORM model (UUID id, name, url, sort_order, created_at)
- **schemas.py** - Pydantic request/response schemas (`PhotoResponse`, `ReorderRequest`)
- **auth.py** - `require_admin` dependency: Supabase Auth JWT validation via ES256/JWKS, plus a check that `sub` equals `ADMIN_USER_ID`
- **storage.py** - S3 upload/delete helpers
- **exceptions.py** - App-level handlers that turn SQLAlchemy and S3 errors into JSON responses; routes don't catch these themselves
- **routers/photos.py** - `GET /photos` (public), `POST /photos`, `PUT /photos/reorder`, `DELETE /photos/{id}` (admin). Uploads are stored under a generated key, which is the photo's `name`

Admin routes declare `dependencies=[Depends(require_admin)]`. Tests override `get_db` and `require_admin` through `app.dependency_overrides`.

### Frontend (client/src/)

- **api/apiClient.ts** - Axios instance with interceptor that injects the Supabase access token on non-GET requests
- **api/supabase.ts** - The Supabase client and `useSession`, a zustand store mirroring the auth session
- **api/services/photos.api.ts** - API call functions (fetch, upload, delete)
- **api/services/photos.query.ts** - React Query hooks (`useFetchPhotos`, `useUploadPhotos`, `useDeletePhoto`, `useReorderPhotos`) with 1-hour stale time; reorder writes the new order to the cache optimistically and rolls back on error
- **api/schemas/photos.schema.ts** - Zod schemas for API responses
- **api/queryClient.ts** - The shared React Query client
- **components/** - React components; `withAuthGuard` wraps protected route components and shows `LoginForm` (email + password) when signed out. `PhotoList` is the public read-only gallery; `PhotoManager` is the admin editor (uploader plus drag-to-reorder and delete via `EditablePhotoView`, which keeps a local copy of the order so dragging stays smooth). `PhotoGrid` owns the loading, error and empty states for both. Only `PhotoList` and `PhotoManager` are exported from `components/Photos`. `Admin` is `SessionHeader` + `PhotoManager`

Routes: `/` (public gallery), `/admin` (protected, requires Supabase login).

Import alias: `@/*` maps to the `client/` root, so imports look like `@/src/components/ui`.

### Database

Single `photos` table in PostgreSQL 17. Columns: `id` (UUID, server-generated), `name` (unique text), `url` (unique text), `sort_order` (int), `created_at` (timestamptz). Row level security is enabled with no policies, so the Supabase Data API can't reach it; the API connects as the table owner. Migrations are managed with Alembic (`alembic upgrade head` in `api/`), which reads its URL from `src.database`; `alembic check` confirms the models match the schema.

### Environment

All services share root `.env`. Backend uses Pydantic Settings; frontend uses `VITE_`-prefixed vars via `import.meta.env`. Required env vars cover: AWS S3 credentials, PostgreSQL connection (Supabase session pooler in production), Supabase Auth config (`SUPABASE_URL` and `ADMIN_USER_ID` for the API, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the client), ImageKit URL, and API base URL.
