# Docker Testing — guia_js

This document explains how to build and run the guia_js test suites inside Docker containers, both locally and in GitHub Actions CI.

---

## Why run tests in Docker?

| Benefit | Detail |
|---|---|
| Reproducibility | Every run starts from the same clean OS baseline (Alpine) |
| CI parity | Local results match GitHub Actions exactly |
| Dependency isolation | Node version, devDependencies, and system packages are pinned |
| Sibling-dep safety | Sibling repos are cloned at build time at known versions |
| No host pollution | No need to install Chromium or Node globally |

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Docker | 24.x |
| Docker Buildx | bundled with Docker Desktop or `docker buildx install` |
| Bash | 4.x (macOS ships Bash 3 — use `brew install bash`) |

All npm-level prerequisites (Node 20, packages) are handled inside the containers.

---

## Project files overview

```
guia_js/
├── Dockerfile.test              # unit / integration runner
├── Dockerfile.test.e2e          # E2E (Puppeteer) runner
├── .dockerignore                # shared build-context exclusions
└── scripts/
    ├── run-tests-docker.sh      # unit test orchestration
    ├── run-e2e-tests-docker.sh  # E2E test orchestration
    └── run-all-tests-docker.sh  # combined: unit then E2E
```

---

## Dockerfile walkthrough

### `Dockerfile.test` — Unit / Integration runner

```
node:20-alpine
  └── apk add git
        └── /workspace/ (WORKDIR)
              ├── git clone paraty_geocore.js@0.12.11-alpha
              ├── git clone bessa_patterns.ts (HEAD)
              └── /workspace/guia_js/ (WORKDIR)
                    ├── COPY package*.json
                    ├── ENV NODE_ENV=test
                    ├── RUN npm ci --ignore-scripts
                    └── COPY . .
```

#### Why clone sibling repos?

`jest.config.unit.js` maps two imports to local filesystem paths:

```js
// jest.config.unit.js (excerpt)
moduleNameMapper: {
  'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.11-alpha/dist/esm/index.js':
    '<rootDir>/../paraty_geocore.js/src/index',
  'bessa_patterns.ts': '<rootDir>/../bessa_patterns.ts/src/index',
}
```

By setting `WORKDIR /workspace/guia_js` and cloning both siblings into `/workspace/`, the relative paths (`../paraty_geocore.js`, `../bessa_patterns.ts`) resolve correctly — **no test file changes required**.

`paraty_geocore.js` is cloned at the exact tag referenced in the mapper (`v0.12.11-alpha`).  
`bessa_patterns.ts` is cloned from the default branch (no version is pinned in the mapper).

#### Why `ENV NODE_ENV=test`?

The `node:20-alpine` base image ships with `NODE_ENV=production`. This causes `npm ci` to silently skip `devDependencies` (Jest, ts-jest, jsdom, etc.). Setting `NODE_ENV=test` before `npm ci` ensures all dev packages are installed.

---

### `Dockerfile.test.e2e` — E2E (Puppeteer) runner

```
node:20-alpine
  └── apk add chromium nss freetype harfbuzz ca-certificates ttf-freefont
        └── ENV PUPPETEER_SKIP_DOWNLOAD=true
              ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
                └── /workspace/guia_js/ (WORKDIR)
                      ├── COPY package*.json
                      ├── ENV NODE_ENV=test
                      ├── RUN npm ci --ignore-scripts
                      └── COPY . .
```

#### Puppeteer + Alpine Chromium strategy

Puppeteer normally downloads its own ~400 MB Chrome bundle during `npm install`. In Docker this wastes build time and image size. Instead:

1. `ENV PUPPETEER_SKIP_DOWNLOAD=true` — disables the bundled download.
2. `apk add chromium` (and its shared-library dependencies) — installs system Chromium.
3. `ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` — tells Puppeteer where to find Chrome.

The E2E tests already launch Puppeteer with `--no-sandbox` and `--disable-setuid-sandbox`, which is required when running as root inside a Docker container.

#### Why no sibling repos?

E2E tests spin up a real browser against `src/index.html` (served by a per-test `http.createServer` on port 9889). The CDN imports (`paraty_geocore.js`, `bessa_patterns.ts`) are fetched by the browser over HTTPS at runtime — the filesystem mapper in `jest.config.unit.js` is not used here.

---

## `.dockerignore`

The `.dockerignore` file prevents large or unnecessary directories from being sent to the Docker build context, keeping builds fast:

```
node_modules/
dist/
coverage/
.jest-cache/
.git/
*.log
.ai_workflow/
venv/
.pytest_cache/
```

---

## Shell scripts walkthrough

### `scripts/run-tests-docker.sh`

1. **Build** the `guia_js-test` image from `Dockerfile.test`.
2. **Run** the container with `-e CI=true` and `--runInBand` (sequential Jest execution, avoids worker-level memory issues).
3. **Report** pass/fail and forward the container's exit code.

Extra Jest arguments can be passed after `--`:

```bash
bash scripts/run-tests-docker.sh -- --testPathPattern=PositionManager
bash scripts/run-tests-docker.sh -- --verbose
```

### `scripts/run-e2e-tests-docker.sh`

Same structure as the unit script, plus:

- Uses `Dockerfile.test.e2e` and image `guia_js-test-e2e`.
- Adds `--shm-size=256m` to the `docker run` command (prevents Chromium crashes from `/dev/shm` exhaustion on Linux).

### `scripts/run-all-tests-docker.sh`

Calls `run-tests-docker.sh` then `run-e2e-tests-docker.sh` in sequence. Both suites always run; the final exit code is the bitwise OR of both exit codes (non-zero if either fails). A combined summary is printed at the end.

---

## Running the tests

### Unit / Integration tests only

```bash
npm run test:docker
# or directly:
bash scripts/run-tests-docker.sh
```

### E2E tests only

```bash
npm run test:docker:e2e
# or directly:
bash scripts/run-e2e-tests-docker.sh
```

### All tests (unit + E2E)

```bash
npm run test:docker:all
# or directly:
bash scripts/run-all-tests-docker.sh
```

### Pass extra Jest arguments

```bash
# Run only tests matching a path pattern
bash scripts/run-tests-docker.sh -- --testPathPattern=AddressCache

# Verbose output
bash scripts/run-e2e-tests-docker.sh -- --verbose
```

---

## Extracting coverage reports

To generate an HTML coverage report and copy it to your host:

```bash
# 1. Run with --coverage and mount coverage/ from the host
docker run --rm \
  -e CI=true \
  -v "$(pwd)/coverage:/workspace/guia_js/coverage" \
  guia_js-test \
  sh -c "npm run test:unit -- --runInBand --coverage"

# 2. Open coverage/lcov-report/index.html in your browser
open coverage/lcov-report/index.html
```

> **Note**: The coverage volume mount path inside the container is `/workspace/guia_js/coverage` (not `/app/coverage`) because `WORKDIR` is set to `/workspace/guia_js`.

---

## CI/CD integration

The workflow is defined at `.github/workflows/test-docker.yml`.

It runs on `push` to `main`/`develop` and on pull requests targeting `main`. Two jobs run in parallel:

| Job | Dockerfile | npm script |
|---|---|---|
| `unit-tests-docker` | `Dockerfile.test` | `test:unit -- --runInBand --coverage` |
| `e2e-tests-docker` | `Dockerfile.test.e2e` | `test:e2e -- --runInBand` |

Both jobs use `docker/build-push-action` with GitHub Actions cache (`type=gha`) for fast incremental builds.

Coverage artifacts from the unit job are uploaded and retained for 14 days.

---

## Troubleshooting

### Sibling repo not found / `Cannot find module '../paraty_geocore.js/…'`

The `Dockerfile.test` clones `paraty_geocore.js` at the tag `0.12.11-alpha`. If the tag no longer exists or the mapper version has changed, update the `--branch` argument in `Dockerfile.test`:

```dockerfile
RUN git clone --depth 1 \
    --branch v<new-tag> \
    https://github.com/mpbarbosa/paraty_geocore.js.git
```

### `devDependencies` not installed / `Cannot find module 'jest'`

Ensure `ENV NODE_ENV=test` appears **before** `RUN npm ci` in the Dockerfile. The base Alpine image ships with `NODE_ENV=production`.

### Chromium crashes / `Target closed` / shared memory errors

Add `--shm-size=256m` (or higher) to your `docker run` command:

```bash
docker run --rm -e CI=true --shm-size=256m guia_js-test-e2e npm run test:e2e
```

The `run-e2e-tests-docker.sh` script already includes this flag.

### Puppeteer can't find Chromium

Verify the `PUPPETEER_EXECUTABLE_PATH` env var is set correctly. Inside the container:

```bash
docker run --rm guia_js-test-e2e which chromium-browser
# expected: /usr/bin/chromium-browser
```

If the path is different (e.g., `/usr/bin/chromium`), update the `ENV` line in `Dockerfile.test.e2e`.

### Tests hang / never exit

The E2E Jest config already sets `forceExit: true`. If the unit suite hangs, add `--forceExit` to the run command:

```bash
bash scripts/run-tests-docker.sh -- --forceExit
```

### Build context is slow

Ensure `.dockerignore` is present at the project root and includes `node_modules/`. The build context should be under 5 MB for a typical checkout.

---

## Quick reference

```bash
# Build images manually (useful for iterating on Dockerfiles)
docker build -f Dockerfile.test     -t guia_js-test     .
docker build -f Dockerfile.test.e2e -t guia_js-test-e2e .

# Run unit tests interactively (bash shell)
docker run --rm -it guia_js-test sh

# Inspect installed packages inside the image
docker run --rm guia_js-test npm ls --depth=0
```

---

*Last updated: 2025-07-15*
