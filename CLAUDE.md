# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photography portfolio web app: React + TypeScript frontend styled with StyleX, FastAPI backend, PostgreSQL database, AWS S3 for photo storage, Supabase Auth for the admin login, and ImageKit for image optimization. All services run via Docker Compose behind an Nginx reverse proxy.

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
python3.15 -m venv .venv && source .venv/bin/activate  # The API targets Python 3.15
pip install -r requirements-dev.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 4000
alembic upgrade head  # Apply migrations
alembic check         # Verify the models match the database schema
```

`requirements.txt` lists only the runtime dependencies the app imports directly; `requirements-dev.txt` adds the test and lint tools. The Dockerfile (`python:3.15-slim`) installs runtime dependencies and runs uvicorn without `--reload`; `docker-compose.yaml` builds the dev container with `requirements-dev.txt` and adds `--reload`. The `/api` prefix that Nginx strips is passed to uvicorn as `--root-path` (overridable with `ROOT_PATH` in the image), not to `FastAPI()`.

### Backend tests

```bash
cd api
pytest                        # Run all tests
pytest tests/test_auth.py     # Run a specific test file
pytest tests/test_auth.py -k "test_name"  # Run a single test
docker compose exec api python -m pytest  # Run inside the running container
```

Route tests in `tests/test_photos.py` override `get_db` and `require_admin` and stub the S3 helpers, so they need no database or AWS access.

### Linting and formatting (backend)

The API uses ruff (`api/ruff.toml`) for linting and formatting. It's in `requirements-dev.txt`, so it runs in the dev container; on the host, use the official image:

```bash
cd api
docker compose exec api ruff check --fix . && docker compose exec api ruff format .
docker run --rm -v "$PWD":/io -w /io ghcr.io/astral-sh/ruff:0.17.3 check .  # Without the stack running
```

### Linting and formatting (frontend)

The client uses oxlint (`client/.oxlintrc.json`, type-aware rules enabled) and oxfmt (`client/.oxfmtrc.json`, which also sorts imports). ESLint and Prettier are not used.

```bash
cd client
bun run lint
bun run format
```

A lefthook pre-commit hook (`lefthook.yml` at the repo root) runs oxlint and `oxfmt --check` on staged client files, and `ruff check` and `ruff format --check` on staged API files (through ruff's Docker image, so Docker must be running). It is installed automatically by `bun install` in `client/`. Keep the ruff image tag in `lefthook.yml` in sync with `ruff` in `api/requirements-dev.txt`.

## Architecture

### Request Flow

Client (port 3000) and API (port 4000) are behind an Nginx reverse proxy (port 3005). Nginx routes `/` to the client and `/api/` to the backend (stripping the `/api` prefix). Max upload size is 20MB, enforced by Nginx locally and by the API itself (`MAX_UPLOAD_MB`), since production may not run behind Nginx.

### Backend (api/src/)

- **main.py** - FastAPI app init, exception handlers, CORS (origins from `CORS_ORIGINS`), router mounting, `GET /healthz` (runs `SELECT 1`, so it returns 503 when the database is down)
- **config.py** - Pydantic `BaseSettings` loading from `.env`
- **database.py** - SQLAlchemy 2.0 engine (`pool_pre_ping` for the Supabase pooler), session factory, `Base`, and the `get_db` dependency (use the `DbSession` annotation in routes). Queries use `select()`, not the legacy `db.query()`
- **models.py** - Single `Photo` ORM model (UUID id, name, url, sort_order, created_at)
- **schemas.py** - Pydantic request/response schemas (`PhotoResponse`, `PhotoIdsRequest`)
- **auth.py** - `require_admin` dependency: Supabase Auth JWT validation via ES256/JWKS, plus a check that `sub` equals `ADMIN_USER_ID`
- **storage.py** - S3 upload and batch delete helpers; `S3_ERRORS` is everything they can raise, for cleanup that only logs
- **exceptions.py** - App-level handlers that turn SQLAlchemy and S3 errors into JSON responses; routes don't catch these themselves
- **routers/photos.py** - `GET /photos` (public), `POST /photos`, `PUT /photos/reorder`, `DELETE /photos` (admin; a JSON body of `photo_ids`). Uploads are stored under a generated key, which is the photo's `name`. `/reorder` puts the listed photos first and the rest after them in their current order, ignores unknown IDs, and returns the saved order; delete ignores unknown IDs

Admin routes declare `dependencies=[Depends(require_admin)]`. Tests override `get_db` and `require_admin` through `app.dependency_overrides`.

### Frontend (client/src/)

- **api/apiClient.ts** - Axios instance with interceptor that injects the Supabase access token on non-GET requests
- **api/supabase.ts** - The Supabase client, `useSession` (a zustand store mirroring the auth session) and `signOut`, which first runs the tasks registered with `onBeforeSignOut` (**api/beforeSignOut.ts**) while the session can still authorize them
- **api/services/photos.api.ts** - API call functions (fetch, upload one file with progress, delete, reorder), plus `deletePhotosOnExit`, a keepalive `fetch` for deletes sent as the page is hidden
- **api/limits.ts** - `MAX_UPLOAD_MB`, kept in sync with the API's setting
- **api/services/photos.query.ts** - React Query hooks (`useFetchPhotos`, `useUploadPhoto`, `useDeletePhotos`, `useReorderPhotos`) with 1-hour stale time; `useDeletePhotos` deletes a batch in one request and refetches once. Reorder writes the new order to the cache optimistically, then the order the server saved, and rolls back on error; saves run one at a time
- **api/schemas/photos.schema.ts** - Zod schemas for API responses
- **api/queryClient.ts** - The shared React Query client
- **components/** - React components; `withAuthGuard` wraps protected route components and shows `LoginForm` (email + password) when signed out. `PhotoList` is the public read-only gallery; `PhotoGrid` owns its loading, error and empty states. `PhotoManager` is the admin editor, built from `Photos/manager/`: a grid of numbered square tiles (`LibraryGrid`) where clicking selects (the floating `SelectionBar` moves selected photos to the start or end, or deletes them) and a mouse drag reorders; touch never drags in the grid. `ArrangeList` is Arrange mode, a list for reordering on touch: only the handle starts a drag (immediately, so iOS never shows its long-press preview), plus up/down arrows and a position picker; it saves on Done. Dragging uses `@dnd-kit/react` (0.x, pinned exactly with `@dnd-kit/dom`, `@dnd-kit/abstract` and `@dnd-kit/helpers`; bump them together). The grid's sensor is mouse-only and it leaves out the accessibility plugin, which would overwrite each tile's `aria-pressed`; Arrange mode keeps it, with announcements that name photos by position (`announcements.ts`). Deletes wait `UNDO_DELAY_MS` behind an Undo toast (`useDeferredDelete`) and are sent early on unmount, before sign-out, or on `pagehide` (with keepalive); photos waiting to be deleted keep their slots in saved orders so Undo puts them back in place. Uploads go one at a time through `useUploadQueue` (sequential so they keep the picked order), from the Upload button or files dropped anywhere on the page; signing out drops files still waiting; the queue is a card on wide screens and a bottom sheet on a phone. `PhotoManager` keeps a local copy of the order so dragging stays smooth. The public gallery deals photos into `Masonry` columns in saved order; hovering a tile (mouse only) tints the page via `AmbientGlow` with a color `photoColor.ts` extracts client-side from a 32px ImageKit thumbnail. `PhotoOverlay` is the viewer: the photo rises into place while the gallery recedes behind it, then slides in from the side being stepped towards (tap zones, swipe, arrow keys, thumbnail strip). Nothing behind the viewer animates while stepping. Only `PhotoList` and `PhotoManager` are exported from `components/Photos`. `Admin` is `SessionHeader` + `PhotoManager`

Routes: `/` (public gallery), `/admin` (protected, requires Supabase login).

- **styles/tokens.stylex.ts** - StyleX design tokens (`colors`, `radii` vars, `breakpoints` consts)
- **index.css** - A minimal global reset; everything else is StyleX

Styling uses StyleX: each component ends with a `stylex.create` block and spreads `stylex.props(...)` onto elements (no `className` strings). `Button` (`components/ui`, used by every page) takes a `variant` and an `xstyle` prop for caller overrides, merged last; styles shared across components, such as `shared.focusRing`, live in `styles/shared.ts`; `className` is omitted from component prop types since StyleX owns it. StyleX is compiled by `@stylexjs/unplugin` in both `vite.config.ts` and `vitest.config.ts` (`stylex.create` throws if uncompiled); both pass the `@/*` alias to it so `.stylex.ts` imports resolve. The Vitest config drops the plugin's dev-server hook, whose polling timer otherwise keeps Vitest from exiting. Class names are generated hashes, so tests compare class lists rather than asserting names.

Import alias: `@/*` maps to the `client/` root, so imports look like `@/src/components/ui`.

### Database

Single `photos` table in PostgreSQL 17. Columns: `id` (UUID, server-generated), `name` (unique text), `url` (unique text), `sort_order` (int), `created_at` (timestamptz). Row level security is enabled with no policies, so the Supabase Data API can't reach it; the API connects as the table owner. Migrations are managed with Alembic (`alembic upgrade head` in `api/`), which reads its URL from `src.database`; `alembic check` confirms the models match the schema.

### Environment

All services share root `.env`. Backend uses Pydantic Settings; frontend uses `VITE_`-prefixed vars via `import.meta.env`. Required env vars cover: AWS S3 credentials, PostgreSQL connection (Supabase session pooler in production), Supabase Auth config (`SUPABASE_URL` and `ADMIN_USER_ID` for the API, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the client), ImageKit URL, and API base URL.
