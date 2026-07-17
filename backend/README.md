# Restock Assistant — Backend

TypeScript/Node backend for the Restock Assistant MVP. See the design source of
truth in [`../docs/restock_assistant_mvp_plan.md`](../docs/restock_assistant_mvp_plan.md)
and the repo guide in [`../CLAUDE.md`](../CLAUDE.md).

**Status:** typed stubs. Every module from the plan's folder structure exists with
signatures and `Not implemented` bodies. Fill them in per the milestones (plan §21).

## Getting started

```bash
cd backend
npm install
npm run typecheck   # must stay green
npm run build       # compiles to dist/
```

Then copy the env template and fill it in:

```bash
cp ../.env.example ../.env   # then edit ../.env
```

## Layout

Mirrors plan §8. Who owns what is in [`OWNERSHIP.md`](OWNERSHIP.md):

- `clients/` — `MicromartClient`, the only module that knows real Micromart endpoints.
- `auth/` — `AuthProvider` interface + `HardcodedCookieAuthProvider` (MVP).
- `services/` — session, planogram, inventory index, command parser, resolver, restock, audit.
- `controllers/` + `routes/` — HTTP surface (framework TBD: Express or Fastify).
- `models/` — shared types (`InventoryItem`, `ParsedCommand`, `RestockEvent`, API responses).
- `config/`, `utils/` — env/Micromart config; text normalization, fuzzy match, logger.

## Conventions

- Depend on the `AuthProvider` interface, never the cookie directly.
- Only `MicromartClient` touches Micromart URLs/payloads.
- Errors return `status: "error"` **with** a `code`; every correction attempt is audit-logged
  (distinct from the diagnostic `utils/logger.ts`).
- Keep `npm run typecheck` passing on every commit.
