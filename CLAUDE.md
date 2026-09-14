# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photography portfolio web app: React + TypeScript frontend, FastAPI backend, PostgreSQL database, AWS S3 for photo storage, Auth0 for authentication, and ImageKit for image optimization. All services run via Docker Compose behind an Nginx reverse proxy.

## Development Commands

### Running the full stack

```bash
docker-compose up          # Start all services at http://localhost:3005
docker-compose up --build  # Rebuild containers and start
```

### Frontend (client/)

```bash
cd client
npm install
npm run dev       # Vite dev server with HMR
npm run build     # Typecheck + Vite production build
npm run preview   # Preview production build
npm run typecheck # tsc (TypeScript 7) over src and the Vite/Vitest configs
npm run test      # Vitest
npm run lint      # oxlint (lint:fix to auto-fix)
npm run format    # oxfmt (format:check to verify only)
npm run check     # typecheck + lint + format:check
```

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
pytest tests/test_main.py     # Run a specific test file
pytest tests/test_main.py -k "test_name"  # Run a single test
```

### Linting and formatting (frontend)

The client uses oxlint (`client/.oxlintrc.json`, type-aware rules enabled) and oxfmt (`client/.oxfmtrc.json`, which also sorts imports and Tailwind classes). ESLint and Prettier are not used.

```bash
cd client
npm run lint
npm run format
```

A lefthook pre-commit hook (`lefthook.yml` at the repo root) runs oxlint and `oxfmt --check` on staged client files. It is installed automatically by `npm install` in `client/`.

## Architecture

### Request Flow

Client (port 3000) and API (port 4000) are behind an Nginx reverse proxy (port 3005). Nginx routes `/` to the client and `/api/` to the backend (stripping the `/api` prefix). Max upload size is 20MB.

### Backend (api/src/)

- **main.py** - FastAPI app init, CORS config, router mounting
- **config.py** - Pydantic `BaseSettings` loading from `.env`
- **database.py** - SQLAlchemy engine, session factory, `get_db()` context manager
- **models.py** - Single `Photo` model (UUID id, name, url, created_at)
- **schemas.py** - Pydantic request/response schemas
- **utils.py** - `VerifyToken` (Auth0 JWT validation via RS256/JWKS), S3 upload/delete helpers
- **exceptions.py** - S3 exception context manager
- **routers/photos.py** - All endpoints: `GET /photos` (public), `POST /photos` (auth), `DELETE /photos/{id}` (auth), `GET /healthz`

Auth is enforced via FastAPI `Security()` dependency using `VerifyToken`.

### Frontend (client/src/)

- **api/apiClient.ts** - Axios instance with interceptor that injects Auth0 JWT on POST/DELETE
- **api/authToken.ts** - Singleton managing the `getAccessTokenSilently` function from Auth0
- **api/services/photos.api.ts** - API call functions (fetch, upload, delete)
- **api/services/photos.query.ts** - React Query hooks (`useFetchPhotos`, `useUploadPhotos`, `useDeletePhoto`) with 1-hour stale time
- **api/schemas/photos.schema.ts** - Zod schemas for API responses
- **api/queryClient.ts** - The shared React Query client
- **components/** - React components; `withAuthGuard` wraps protected route components, `Admin` is the authenticated management page

Routes: `/` (public gallery), `/admin` (protected, requires Auth0 login).

Import alias: `@/*` maps to the `client/` root, so imports look like `@/src/components/ui`.

### Database

Single `photos` table in PostgreSQL 17. Columns: `id` (UUID, server-generated), `name` (unique text), `url` (unique text), `created_at` (timestamptz). Alembic is installed for migrations.

### Environment

All services share root `.env`. Backend uses Pydantic Settings; frontend uses `VITE_`-prefixed vars via `import.meta.env`. Required env vars cover: AWS S3 credentials, PostgreSQL connection, Auth0 config (both frontend and backend), ImageKit URL, and API base URL.
