---
name: go-live-prod
description: >
  Deploy the current guia_js main-branch release LIVE to production at
  https://mpbarbosa.com/guia_js/. Two stages: publish the built dist/ into the
  mpbarbosa.com staging repo from the dev box (npm run deploy), then go live on
  the prod web server over SSH by rsyncing the staging repo into
  /var/www/mpbarbosa.com. Use when the user asks to "deploy guia_js to prod",
  "go live", "ship it", or "release to production" — the step BEYOND the release
  pipeline's publish, which only stages and never updates the running site.
---

## Overview

guia_js is a **static Vite SPA** (no server, no systemd, no /api/health). Going
live is a **two-stage, three-repo** flow, and there is **no CI auto-deploy** — a
push to the `mpbarbosa.com` repo only *stages*; the live site changes only when
stage B runs **on the prod host**.

- **guia_js** — builds `dist/` and publishes it into the staging repo.
- **mpbarbosa.com** — a git-versioned **staging** repo aggregating every
  project's built assets under a subtree (`guia_js/`, `agora_na_copa_2026/`, …).
- **mpbarbosa_site** — owns the production deploy scripts that rsync the staging
  repo into the live nginx root `/var/www/mpbarbosa.com`.

> **Authorization gate.** Stages A–B are outward-facing production actions. The
> auto-mode permission classifier **will block** `npm run deploy` and every
> `plink`/SSH command (even a read-only recon) unless the user has **explicitly**
> authorized a production deploy in this session. Get that explicit "yes, deploy
> to prod" first. If the classifier still blocks a command, **stop and ask the
> user to approve it** (or run it themselves) — never work around the denial.

## Facts about this deployment

- **Live URL:** `https://mpbarbosa.com/guia_js/`
- **Prod host:** `ubuntu@18.229.20.196` (reports private hostname `ip-172-31-7-80`),
  driven non-interactively with `plink -batch -i ~/Downloads/web_server.ppk`
  (`pscp` for files). Host key is cached (`-batch` is safe); sudo is NOPASSWD —
  but **stage B needs no sudo**: `/var/www/mpbarbosa.com` is owned by and writable
  by `ubuntu`. (Same box as agora — see its `reference_prod_ssh_access_plink`.)
- **No version guard.** Unlike agora's `go-live`, stage B is a plain rsync — it
  always overwrites, no strict "payload > live" check. A version bump is therefore
  **not required to roll out**, but you should still bump so the live `<meta
  name="version">` and `check-version-consistency` reflect the release.
- **The dev box is not the prod host** (`/var/www/mpbarbosa.com` does not exist
  locally). Stage B must run over SSH on `18.229.20.196`.
- **`scripts/deploy.sh` refuses a dirty tree** — both the guia_js worktree and the
  sibling `mpbarbosa.com` checkout must be clean.

## Stage 0 — Preconditions

```bash
guia=~/Documents/GitHub/guia_js
mpb=~/Documents/GitHub/mpbarbosa.com
node -p "require('$guia/package.json').version"          # release version
git -C "$guia" status -sb | head -1; git -C "$guia" status --porcelain   # on main, clean
git -C "$mpb"  status -sb | head -1; git -C "$mpb"  status --porcelain   # clean, has upstream
curl -fsS --max-time 15 https://mpbarbosa.com/guia_js/index.html \
  | grep -oE '<meta name="version" content="[^"]*"'      # current LIVE version
```

If the version wasn't bumped for this release, bump it first and make
`check-version-consistency` pass — the bump must touch **all** of: `package.json`,
`src/config/defaults.ts` (`APP_VERSION` — clear `prerelease` for a stable release
and keep `toString()` suffix-free when empty), `README.md` line 7,
`.workflow-config.yaml`, and the `src/index.html` `<meta name="version">`. Verify
with `./.github/scripts/check-version-consistency.sh` (exit 0), then commit + push
`main`.

## Stage A — Publish to staging (dev box)

**Requires explicit authorization** (see gate). Runs preflight (build + validate
`dist/`) → rsyncs `dist/` into `mpbarbosa.com/guia_js/` → commits + pushes staging:

```bash
cd ~/Documents/GitHub/guia_js && npm run deploy
```

Ends with `✓ Deployment complete.` and a `mpbarbosa.com` push line
(`<old>..<new>  main -> main`). Note that new SHA — stage B's `git pull` on prod
must fast-forward to it.

## Stage B — Go live on the prod host

**Requires explicit authorization.** `mpbarbosa_site/shell_scripts/prod_deploy.sh`
pulls the staging repo and runs
`sync_to_staging.sh --step2 --production-dir /var/www/mpbarbosa.com`:

```bash
plink -batch -i ~/Downloads/web_server.ppk ubuntu@18.229.20.196 \
  "bash -lc 'cd ~/Documents/GitHub/mpbarbosa_site && ./shell_scripts/prod_deploy.sh'"
```

Expect: `Updating <old>..<new> … Fast-forward` listing the `guia_js/assets/*`
changes, then `✓ Step 2 completed successfully! Files deployed to production web
server`. (Optional read-only recon first: `git -C ~/Documents/GitHub/mpbarbosa.com
rev-parse --short HEAD` on the box should match stage A's pushed SHA before you
run, and `test -w /var/www/mpbarbosa.com` should pass.)

## Verify

```bash
curl -fsS --max-time 15 https://mpbarbosa.com/guia_js/index.html \
  | grep -oE '<meta name="version" content="[^"]*"|assets/main-[A-Za-z0-9_-]+\.js'
# Critical asset + required offline data must both be 200 (DEPLOYMENT.md gotchas):
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
  https://mpbarbosa.com/guia_js/assets/main-<HASH>.js
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
  https://mpbarbosa.com/guia_js/libs/sidra/tab6579_municipios.json
```

The live `<meta name="version">` must equal the release version **and** the served
`main-<hash>.js` must equal the hash stage A just built (proves new code, not a
cache). `libs/sidra/tab6579_municipios.json` must be `200 application/json`.

## What to report when done

```
✓ Stage A   Published dist/ → mpbarbosa.com/guia_js, pushed staging (<old>..<new>)
✓ Stage B   prod_deploy.sh: pulled staging on prod, rsynced to /var/www/mpbarbosa.com
✓ Verified  https://mpbarbosa.com/guia_js/ → 200, meta version X.Y.Z, serving main-<hash>.js
✓ Sanity    new JS bundle 200; libs/sidra/tab6579_municipios.json 200 application/json
```

## Safety rules

- **Explicit authorization first**; if the classifier blocks a command, stop and
  ask — never work around the denial.
- **Both worktrees clean** (`deploy.sh` enforces this).
- **Never build on the prod host** — stage B is build-free (rsync only).
- **Verify the live meta version AND the served asset hash** before declaring
  success — an unchanged hash means a cache/skip, not a rollout.
- Don't force-push; report the failing step marker (`==> [N/5]` for deploy.sh, or
  the prod `Fast-forward`/`Step 2` line) rather than retrying silently.
