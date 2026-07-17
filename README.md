# Restock Assistant

A mobile-first, voice/text-assisted restocking tool for vending machine stockers. Instead of navigating the existing Micromart website while physically restocking a machine, a stocker gives a simple command like:

```text
set fairlife to 5
```

The app sends the command to our backend, which interprets it, identifies the intended product from the active machine's planogram, finds the correct Micromart inventory identifier, and submits the restock correction event to Micromart. The stocker then sees whether the update succeeded or failed.

> **Course:** CS 4398 — Software for Voice-Assisted Vending Machine Restocking
> **Team:** Caden Sprague, Devin Schupbach, Joel Sarmiento

---

## Why

A vending machine stocking company wants a faster way for stockers to update inventory in the field. The company runs multiple machine systems (365 and Micromart), but this project focuses first on **Micromart** restocking. The goal is to cut down the time a stocker spends interacting with the Micromart website while stocking products.

The team is responsible for the mobile assistant and backend service that help the stocker interact with Micromart more efficiently. We are **not** building or modifying the Micromart platform, the vending hardware, or the company's existing website.

---

## How It Works

```text
[React Native / Expo Mobile App]
        |
        | JSON over HTTP
        v
[TypeScript Backend API]
        |
        | Authenticated API calls (hardcoded cookie for MVP)
        v
[Micromart API]
```

The end-to-end loop the MVP proves:

```text
Start session -> fetch planogram -> enter command -> resolve item -> submit correction -> show result
```

1. Stocker starts a restock session in the app.
2. Backend fetches the machine's planogram from Micromart and builds a searchable inventory index.
3. Stocker types (or speaks) a command like `set fairlife to 5`.
4. Backend parses the command, resolves the product name to a `site_inventory_id`, and handles ambiguity (e.g. multiple Fairlife products) by asking the stocker to pick.
5. Backend posts the restock correction event to Micromart and returns a clean result.
6. App shows success or error.

---

## MVP Scope

Intentionally simplified for the first version:

- Single user, one active restock session at a time.
- Auth to Micromart uses a **manually supplied session cookie** (hardcoded via `.env`) — no login UI or 2FA yet. Auth is abstracted behind an `AuthProvider` so real login/2FA can be added later without rewriting the rest of the backend.
- Backend owns **all** Micromart calls; the mobile app only talks to our backend.
- Planogram is fetched at session start; product matching starts simple (exact/alias/contains) and grows into fuzzy matching.

Full details — API contract, data models, milestones, and future enhancements — live in [`restock_assistant_mvp_plan.md`](docs/restock_assistant_mvp_plan.md).

---

## Tech Stack

```text
Mobile:   React Native / Expo / TypeScript
Backend:  Node.js / TypeScript / Fastify or Express
Config:   dotenv
API:      fetch or Axios
Storage:  in-memory (MVP), later SQLite or Postgres
```

---

## Team & Ownership

The work is split into three vertical slices, one owner each:

### Person 1 — Backend / Micromart Integration — *Caden*
Owns the TypeScript backend: hardcoded auth cookie setup, the Micromart API client, planogram fetching, restock session handling, and posting correction events back to Micromart.

### Person 2 — Mobile App / Frontend — *Devin*
Owns the React Native / Expo app: the session screen, command input, success/error messages, loading states, and the UI for choosing between multiple matching products.

### Person 3 — Command + Inventory Resolver Service — *Joel*
Owns the product intelligence layer: parsing commands like "set fairlife to 5," normalizing product names, building the searchable product index from the planogram, handling fuzzy matches, and returning "matched," "not found," or "which item did you mean?" results.

---

## Repo Layout

```text
restock-assistant/
  README.md                       # this file
  restock_assistant_mvp_plan.md   # detailed architecture, API contract, milestones
  Project Proposal - CS 4398.txt  # original course proposal
  SRS/                            # software requirements spec
```

Backend (`backend/`) and mobile (`frontend/`) folders will be added as development starts — see the MVP plan for the proposed structure of each.
