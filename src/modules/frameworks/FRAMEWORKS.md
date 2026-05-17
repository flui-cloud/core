# Framework Detection — Reference Documentation

This document describes all framework detectors implemented in Flui. Each detector identifies a specific framework from repository signals (files, package.json, config files) and generates a ready-to-build Dockerfile plus a deployment plan.

---

## How detection works

When a repository is analyzed (`POST /repositories/:id/analyze` or `POST /repositories/github/public/analyze`), the system:

1. Lists files and reads `package.json`
2. Runs all registered detectors in parallel
3. Selects the detector with the highest **confidence** score (priority is used as a tiebreaker)
4. Generates a **Dockerfile** and a **build plan** (resources, health check, networking, scaling)
5. Runs env-var detection and returns `envVarSuggestions` alongside the plan

The `confidence` score is a value from 0–100. A detector returns 0 if its primary signals are absent.

---

## Detection signals reference

| Signal | Type | Example |
|---|---|---|
| `rootFiles` | File list | `['next.config.ts', 'package.json']` |
| `files` | Full recursive file list | `['src/pages/index.tsx', ...]` |
| `packageJson.dependencies` | npm deps | `{ "next": "^14.0.0" }` |
| `packageJson.devDependencies` | npm dev deps | `{ "@vitejs/plugin-react": "^4.0.0" }` |
| `packageJson.scripts` | npm scripts | `{ "build": "vite build" }` |
| `packageManager` | Detected PM | `npm`, `pnpm`, `yarn`, `bun` |
| `nodeVersion` | From `.nvmrc` / engines | `"20"` |
| `fluiConfig` | `.flui.yaml` overrides | port, resources, env |

---

## JavaScript / TypeScript frameworks

### Dockerfile (Custom)

| | |
|---|---|
| **Priority** | 100 (highest — always wins if Dockerfile exists) |
| **Category** | passthrough |
| **Build mode** | — (uses existing Dockerfile as-is) |
| **Default port** | Read from `EXPOSE` directive; falls back to 8080 |

**Detection signals:**
- `Dockerfile` present in repository root

**Notes:** No build transformation is applied. The existing Dockerfile is used verbatim. A warning is emitted if no `EXPOSE` directive is found or if `:latest` tag is used.

---

### Next.js

| | |
|---|---|
| **Priority** | 85 |
| **Category** | fullstack |
| **Supported versions** | 13.x, 14.x, 15.x |
| **Build modes** | `ssr` (default), `static` (when `output: 'export'`), `standalone` |
| **Default port** | 3000 |
| **Env file hints** | `.env.example`, `.env.local.example`, `.env.template` |

**Detection signals:**
- `next.config.js` / `next.config.mjs` / `next.config.ts` in root (+95)
- `next` in `dependencies` (+5–85)

**Detected features:** `app-router`, `pages-router`, `hybrid-router`, `api-routes`, `middleware`, `image-optimization`

**Runtime resources:**
```
CPU:    500m request / 1000m limit
Memory: 512Mi request / 1Gi limit
```

**Build notes:**
- SSR mode: multi-stage build using `output: standalone`, copies `.next/standalone` and `.next/static`
- Static mode: builds with `next build`, serves via nginx
- Non-root user (`nextjs`) used in final stage

---

### Angular

| | |
|---|---|
| **Priority** | 80 |
| **Category** | frontend |
| **Supported versions** | 16.x, 17.x, 18.x |
| **Build mode** | `spa` → nginx |
| **Default port** | 80 |
| **Env file hints** | `.env.example` |

**Detection signals:**
- `angular.json` in root (+95)
- `@angular/core` in `dependencies` (+5–85)

**Detected features:** `standalone-components`, `routing`, `services`

**Runtime resources:**
```
CPU:    500m request / 1000m limit
Memory: 512Mi request / 1Gi limit
```

**Build notes:** Produces a multi-stage Dockerfile that builds the Angular app and serves `dist/` via nginx with SPA routing (`try_files $uri /index.html`), gzip compression, and security headers.

---

### NestJS

| | |
|---|---|
| **Priority** | 75 |
| **Category** | backend |
| **Supported versions** | 9.x, 10.x, 11.x |
| **Build mode** | `production` |
| **Default port** | 3000 |
| **Env file hints** | `.env.example`, `.env.template` |

**Detection signals:**
- `nest-cli.json` in root (+95)
- `@nestjs/core` in `dependencies` (+5–85)

**Detected features:** `graphql`, `microservices`, `websockets`, `typeorm`, `mongoose`, `swagger`, `bull-queue`

**Runtime resources:**
```
CPU:    250m request / 500m limit
Memory: 256Mi request / 512Mi limit
```

**Build notes:** Multi-stage TypeScript build; reads `entryFile` from `nest-cli.json` for the `CMD`. Non-root user (`nestjs`) in final stage.

---

### Remix

| | |
|---|---|
| **Priority** | 76 |
| **Category** | fullstack |
| **Supported versions** | 1.x, 2.x |
| **Build mode** | `ssr` |
| **Default port** | 3000 |
| **Env file hints** | `.env.example` |

**Detection signals:**
- `remix.config.js` / `remix.config.ts` in root (+45)
- `@remix-run/node` in `dependencies` (+25)
- `@remix-run/react` in `dependencies` (+20)
- `@remix-run/dev` in `devDependencies` (+10)

**Detected features:** `file-routing`, `react`, `typescript`, `tailwind`, `prisma`

**Runtime resources:**
```
CPU:    200m request / 500m limit
Memory: 256Mi request / 512Mi limit
```

---

### Nuxt

| | |
|---|---|
| **Priority** | 74 |
| **Category** | fullstack |
| **Supported versions** | 3.x |
| **Build mode** | `ssr` (with `server/` dir), `production` otherwise |
| **Default port** | 3000 |
| **Env file hints** | `.env.example` |

**Detection signals:**
- `nuxt.config.ts` / `nuxt.config.js` in root (+50)
- `nuxt` in `dependencies` or `devDependencies` (+40)
- `pages/` directory (+10)

**Detected features:** `pages-router`, `server-api`, `components`, `pinia`, `tailwind`

**Runtime resources:**
```
CPU:    250m request / 500m limit
Memory: 256Mi request / 512Mi limit
```

**Build notes:** Uses Nuxt's `.output/server/index.mjs` as entry point. Sets `NUXT_HOST=0.0.0.0`.

---

### SvelteKit

| | |
|---|---|
| **Priority** | 73 |
| **Category** | fullstack |
| **Supported versions** | 1.x, 2.x |
| **Build mode** | `ssr` (adapter-node), `static` (adapter-static) |
| **Default port** | 3000 (SSR) / 80 (static) |
| **Env file hints** | `.env.example`, `.env.template` |

**Detection signals:**
- `svelte.config.js` / `svelte.config.ts` in root (+45)
- `@sveltejs/kit` in `devDependencies` or `dependencies` (+40)
- `svelte` in `devDependencies` (+15)

**Detected features:** `file-routing`, `api-routes`, `typescript`, `tailwind`, `backend-integration`, `adapter-node`, `adapter-static`, `adapter-auto`

**Runtime resources:**
```
CPU:    100m request / 300m limit
Memory: 128Mi request / 256Mi limit
```

**Build notes:** Adapter determines output. `adapter-node` → Node.js server at `build/index.js`. `adapter-static` → nginx serving `build/` directory.

---

### React (Vite)

| | |
|---|---|
| **Priority** | 72 |
| **Category** | frontend |
| **Supported versions** | 18.x, 19.x |
| **Build mode** | `spa` → nginx |
| **Default port** | 80 |
| **Env file hints** | `.env.example` |

**Detection signals:**
- `vite.config.ts` / `vite.config.js` / `vite.config.mjs` in root (+40)
- `@vitejs/plugin-react` or `@vitejs/plugin-react-swc` in `devDependencies` (+35)
- `react` in `dependencies` (+25)

**Detected features:** `swc`, `react-router`, `react-query`, `state-management`, `tailwind`, `typescript`

**Runtime resources:**
```
CPU:    100m request / 200m limit
Memory: 64Mi request / 128Mi limit
```

**Build notes:** Produces `dist/` via `vite build`, served by nginx. Optional `nginx.conf` copied if present.

---

### Astro

| | |
|---|---|
| **Priority** | 71 |
| **Category** | frontend |
| **Supported versions** | 2.x, 3.x, 4.x |
| **Build mode** | `static` (default) → nginx, `ssr` (with `@astrojs/node`) → Node.js |
| **Default port** | 80 (static) / 4321 (SSR) |
| **Env file hints** | `.env.example` |

**Detection signals:**
- `astro.config.mjs` / `astro.config.ts` / `astro.config.js` in root (+50)
- `astro` in `dependencies` or `devDependencies` (+40)
- `src/pages/` directory (+10)

**Detected features:** `pages`, `react`, `vue`, `svelte`, `tailwind`, `mdx`, `adapter-node`, `adapter-vercel`

**Runtime resources:**
```
CPU:    100m request / 200m limit
Memory: 128Mi request / 256Mi limit
```

**Build notes:** Static output in `dist/` → nginx. SSR with `@astrojs/node` → `dist/server/entry.mjs`.

---

### Vue (Vite)

| | |
|---|---|
| **Priority** | 70 |
| **Category** | frontend |
| **Supported versions** | 3.x |
| **Build mode** | `spa` → nginx |
| **Default port** | 80 |
| **Env file hints** | `.env.example` |

**Detection signals:**
- `vite.config.ts` / `vite.config.js` / `vite.config.mjs` in root (+40)
- `@vitejs/plugin-vue` or `@vitejs/plugin-vue-jsx` in `devDependencies` (+35)
- `vue` in `dependencies` (+25)

**Detected features:** `vue-router`, `pinia`, `vuex`, `jsx`, `typescript`, `tailwind`

**Runtime resources:**
```
CPU:    100m request / 200m limit
Memory: 64Mi request / 128Mi limit
```

---

### Express.js

| | |
|---|---|
| **Priority** | 55 (low — many frameworks depend on express internally) |
| **Category** | backend |
| **Supported versions** | 4.x, 5.x |
| **Build mode** | `production` |
| **Default port** | 3000 |
| **Env file hints** | `.env.example`, `.env.template` |

**Detection signals:**
- `express` in `dependencies` (+60)
- `main` field in `package.json` (+15)
- `start` script in `package.json` (+10)
- `dev` script in `package.json` (+5)

**Exclusions:** Skipped if `@nestjs/core` or `nuxt` is also in `dependencies` (those detectors take priority).

**Detected features:** `validation` (express-validator), `cors`, `helmet`, `orm` (mongoose/sequelize), `typescript`, `auth` (passport/jsonwebtoken)

**Runtime resources:**
```
CPU:    100m request / 500m limit
Memory: 128Mi request / 256Mi limit
```

**Build notes:** TypeScript projects → multi-stage build compiling to `dist/`. Plain JS projects → single-stage, installs prod deps only.

---

## Python frameworks

### Django

| | |
|---|---|
| **Priority** | 65 |
| **Category** | backend |
| **Supported versions** | 3.x, 4.x, 5.x |
| **Build mode** | `production` |
| **Default port** | 8000 |
| **Env file hints** | `.env.example`, `.env.template` |

**Detection signals:**
- `manage.py` in root (+60)
- Any `settings.py` file (+25)
- Any `urls.py` file (+10)
- Any `wsgi.py` file (+5)

**Detected features:** `wsgi`, `asgi`, `requirements-txt`, `pipenv`, `pyproject`, `celery`, `docker-ready`

**Runtime resources:**
```
CPU:    200m request / 500m limit
Memory: 256Mi request / 512Mi limit
```

**Build notes:** Uses `gunicorn` for WSGI apps, `uvicorn` for ASGI apps. Runs `collectstatic` during build (suppressed if it fails). Base image: `python:3.12-slim`.

---

### FastAPI

| | |
|---|---|
| **Priority** | 67 |
| **Category** | backend |
| **Supported versions** | 0.x |
| **Build mode** | `production` |
| **Default port** | 8000 |
| **Env file hints** | `.env.example`, `.env.template` |

**Detection signals:**
- `main.py` in root or `app/main.py` in files (+30)
- `pyproject.toml` (+25) / `requirements.txt` (+20) / `Pipfile` (+15)
- `routers/` or `api/v` directories (+15)

**Exclusion:** Skipped if `manage.py` is present (Django takes priority).

**Detected features:** `routers`, `pydantic-models`, `alembic`, `celery`, `docker-compose`, `requirements-txt`, `pipenv`, `pyproject`

**Runtime resources:**
```
CPU:    200m request / 500m limit
Memory: 256Mi request / 512Mi limit
```

**Build notes:** Uses `uvicorn[standard]` as server. Entry point assumed to be `main:app`. Base image: `python:3.12-slim`.

---

### Flask

| | |
|---|---|
| **Priority** | 60 |
| **Category** | backend |
| **Supported versions** | 2.x, 3.x |
| **Build mode** | `production` |
| **Default port** | 5000 |
| **Env file hints** | `.env.example`, `.env.template` |

**Detection signals:**
- `app.py` in root (+35) / `application.py` (+30) / `wsgi.py` (+20)
- `app/__init__.py` in files (+25)
- `requirements.txt` (+15) / `pyproject.toml` (+15) / `Pipfile` (+15)

**Exclusions:** Skipped if `manage.py` (Django) or `main.py` (FastAPI) is present.

**Detected features:** `wsgi`, `blueprints`, `database`, `flask-migrate`, `celery`, `makefile`, `requirements-txt`, `pipenv`, `pyproject`

**Runtime resources:**
```
CPU:    100m request / 300m limit
Memory: 128Mi request / 256Mi limit
```

**Build notes:** Uses `gunicorn` with 4 workers. Entry point derived from the detected Python file (`app.py` → `app:app`, `application.py` → `application:app`). Base image: `python:3.12-slim`.

---

## Go

### Go

| | |
|---|---|
| **Priority** | 62 |
| **Category** | backend |
| **Supported versions** | 1.20+ |
| **Build mode** | `production` |
| **Default port** | 8080 |
| **Env file hints** | `.env.example`, `.env.template` |

**Detection signals:**
- `go.mod` in root (+70)
- `go.sum` in root (+20)
- `main.go` anywhere in files (+10)

**Detected features:** `gin`, `fiber`, `echo`, `chi`, `gorilla-mux`, `cmd-layout`, `internal-layout`, `pkg-layout`, `api-layout`, `makefile`, `air-live-reload`

**Runtime resources:**
```
CPU:    100m request / 300m limit
Memory: 64Mi request / 128Mi limit
```

**Build notes:** Multi-stage build with `golang:1.23-alpine` for compilation, `alpine:latest` for the minimal final image. Binary compiled with `CGO_ENABLED=0 GOOS=linux` for a fully static executable. Includes `ca-certificates` and `tzdata` for TLS and timezone support.

---

## Deployment plan fields

Every detector produces an `IBuildPlan` with the following fields:

| Field | Description |
|---|---|
| `dockerfile` | Complete Dockerfile content as a string |
| `buildContext` | Docker build context (always `.`) |
| `buildEnv` | Build-time env vars from `.flui.yaml` |
| `runtimeEnv` | Runtime env vars from `.flui.yaml` |
| `resources.cpu` | `{ request, limit }` (Kubernetes CPU) |
| `resources.memory` | `{ request, limit }` (Kubernetes memory) |
| `healthCheck` | `{ enabled, path, port, initialDelaySeconds, periodSeconds, timeoutSeconds, ... }` |
| `networking` | `{ port, protocol, ingressEnabled }` |
| `scaling` | `{ enabled, minReplicas, maxReplicas, targetCPUUtilization }` |
| `envVarSuggestions` | See env-var detection docs |
| `metadata.detectionConfidence` | 0–100 score from the detector |
| `metadata.templateVersion` | e.g. `nextjs-14-ssr` |
| `metadata.warnings` | Array of advisory messages |

---

## Priority order summary

| Priority | Framework | Category |
|---|---|---|
| 100 | Dockerfile (Custom) | passthrough |
| 85 | Next.js | fullstack |
| 80 | Angular | frontend |
| 76 | Remix | fullstack |
| 75 | NestJS | backend |
| 74 | Nuxt | fullstack |
| 73 | SvelteKit | fullstack |
| 72 | React (Vite) | frontend |
| 71 | Astro | frontend |
| 70 | Vue (Vite) | frontend |
| 67 | FastAPI | backend |
| 65 | Django | backend |
| 62 | Go | backend |
| 60 | Flask | backend |
| 55 | Express.js | backend |

When two detectors both report non-zero confidence, the one with the **higher confidence score** wins. Priority is only used as a tiebreaker when scores are equal.

---

## Overriding detection via `.flui.yaml`

Detection results can be overridden at the project level using a `.flui.yaml` file in the repository root:

```yaml
version: "1.0"

framework:
  mode: static          # override build mode (e.g. force static for Next.js)

runtime:
  port: 8080            # override container port
  protocol: http
  env:
    - name: DATABASE_URL
      value: ""

build:
  command: "npm run build:prod"   # override build command
  env:
    - name: NODE_ENV
      value: production

resources:
  cpu:
    request: "500m"
    limit: "1000m"
  memory:
    request: "512Mi"
    limit: "1Gi"

scaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilization: 70
```
