# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

The `backend/` scaffold now exists as **typed stubs** — every module from the MVP plan's folder structure is present with signatures and `Not implemented` bodies (implementations land per the milestones). The `mobile/` app (Devin's, plan §20) is not scaffolded yet. Ownership of each backend file is listed in [`backend/OWNERSHIP.md`](backend/OWNERSHIP.md).

The authoritative design document is [`docs/restock_assistant_mvp_plan.md`](docs/restock_assistant_mvp_plan.md). It specifies the folder structures, data models, API contract, error codes, and build order. **Read it before implementing anything** — it is the source of truth for interfaces and naming.

**Keeping the source of truth honest:** if a request deviates from the MVP plan in a meaningful way (interfaces, data models, API contract, error codes, naming, or architecture), do not silently implement the deviation. First confirm with the user that the change is intended. Once confirmed, update `docs/restock_assistant_mvp_plan.md` (and any affected doc such as `docs/uml.md` or `SRS/srs.tex`) in the same change so the plan and the code stay in sync. Trivial wording differences don't require confirmation.

## What This Project Is

A mobile-first tool that lets a vending-machine stocker restock via simple commands like `set fairlife to 5`. The mobile app sends the raw command text to our backend; the backend parses it, resolves the product name against the active machine's planogram to a Micromart `site_inventory_id`, submits a restock correction event to the external Micromart API, and returns a clean result.

The team builds **only** the mobile assistant and the backend — not the Micromart platform, vending hardware, or the company's website.

## Architecture (planned)

```
[React Native / Expo App]  --JSON/HTTP-->  [TypeScript Backend]  --auth'd calls-->  [Micromart API]
```

The single most important design principle, which every change should preserve:

- **Frontend** sends user intent only. It never sees Micromart cookies, endpoints, planogram parsing, or matching rules. It only talks to our backend.
- **Backend** owns all business logic: session state, planogram fetch, inventory index, command parsing, product resolution, restock submission.
- **`MicromartClient`** is the *only* module that knows real Micromart endpoints/payloads.
- **`AuthProvider`** is the *only* abstraction for auth. The MVP uses `HardcodedCookieAuthProvider` (cookie from `.env`); real login/2FA arrives later as `LoginAuthProvider` **without** touching command/planogram/restock logic. Depend on the `AuthProvider` interface, never on the cookie directly.

### Backend request flow

`/session/start` → fetch planogram from Micromart → build `InventoryIndex` (held in memory for the single active session) → `/commands` parses text into `ParsedCommand` → resolver maps `productQuery` to an `InventoryItem`. Resolution is **layered**: exact normalized name → alias → contains → fuzzy. Multiple good matches return `status: "needs_confirmation"` with options; the app then calls `/commands/confirm` with a chosen `siteInventoryId`. Confirmed intent becomes the Micromart payload `{ type: "correct", quantity, site_inventory_id }`.

Backend responses always carry a `status` of `success` | `error` | `needs_confirmation`, and errors carry a `code` (e.g. `SESSION_NOT_READY`, `AUTH_EXPIRED`, `INVALID_QUANTITY`). Every attempted correction is audit-logged.

## MVP Constraints

- Single user, one active restock session at a time; state is in-memory (SQLite/Postgres later).
- Micromart auth is a **manually supplied session cookie** in `.env` — no login UI or 2FA.
- Keep the inventory model rich (`InventoryItem` with `aliases`, `normalizedName`, etc.) — do **not** collapse the planogram to `{ name: id }`; duplicates and disambiguation depend on it.

## Ownership (vertical slices)

- **Caden** — backend / Micromart integration (`MicromartClient`, auth, planogram, restock).
- **Devin** — React Native / Expo app (session, command, match-confirmation screens).
- **Joel** — command + inventory resolver (parsing, normalization, index, fuzzy matching).

## Tooling

### Backend (`backend/`)

Run from the `backend/` directory:

```bash
npm install          # install deps (Fastify) + dev deps (TypeScript, @types/node)
npm run typecheck    # tsc --noEmit — the current gate; must stay green
npm run build        # tsc -> dist/
npm start            # node --env-file=../.env dist/server.js  (needs a built dist/ + .env)
npm run dev          # build, then start
```

The web framework is **Fastify** (plan §5). It is isolated to the composition
root (`src/app.ts`) and the route adapters (`src/routes/*.ts`); controllers and
services stay framework-agnostic. There is no lint/test yet — add those scripts
as they land, and keep `npm run typecheck` passing on every commit.

### Other

- **SRS document** (`SRS/srs.tex`): a LaTeX Software Requirements Spec. Build with `pdflatex srs.tex` (or `latexmk -pdf srs.tex`) from the `SRS/` directory. Generated PDFs and LaTeX aux files are gitignored.
- `.env` is gitignored and holds `MICROMART_COOKIE`, `MICROMART_BASE_URL`, `DEFAULT_SITE_ID`, `DEFAULT_RESTOCK_SESSION_ID`, `PORT`. Copy [`.env.example`](.env.example) to `.env` and fill in the values.
