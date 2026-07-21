# Restock Assistant MVP Plan

## 1. Project Summary

The Restock Assistant is a mobile-first tool designed to speed up restocking workflows by allowing a restocker to enter simple commands such as:

```text
set fairlife to 5
```

The system resolves the product name against the active site's planogram, finds the correct `site_inventory_id`, and submits a restock correction event to the external Micromart API.

For the real MVP, the project will use:

```text
Frontend: React Native / Expo
Backend: TypeScript / Node.js
External API: Micromart REST endpoints
Auth: hardcoded cookie/session for MVP only
User model: single-user MVP
```

The goal is to build a real working MVP while keeping the architecture clean enough to support future login, 2FA, multiple users, multiple sites, and richer command handling.

---

## 2. Core MVP Assumptions

For the first version, we will intentionally simplify authentication and user management.

### MVP Assumptions

- One user only.
- One active restock session at a time.
- Auth cookie/session is manually obtained and hardcoded through environment variables.
- No login UI yet.
- No 2FA handling yet.
- Backend owns all Micromart API calls.
- Mobile app only communicates with our backend.
- Product matching starts simple, then becomes more advanced.
- Planogram is fetched at the start of the restock session.
- Restock correction events are submitted through the backend.

### Explicit TODO Later

Authentication will be abstracted behind an `AuthProvider` so hardcoded-cookie auth can later be replaced with a real login and 2FA-aware flow.

---

## 3. High-Level Architecture

```text
[React Native / Expo Mobile App]
        |
        | JSON over HTTP
        v
[TypeScript Backend API]
        |
        | Authenticated API calls
        v
[Micromart API]
```

### Main Responsibilities

```text
Mobile App
  - Start or connect to a restock session
  - Accept typed commands
  - Display success/error messages
  - Handle ambiguous product selection
  - Eventually support voice input

Backend
  - Store MVP session configuration
  - Provide auth headers using hardcoded cookie
  - Fetch planogram
  - Build inventory index
  - Parse user commands
  - Resolve product names to site_inventory_id
  - Submit restock correction events
  - Return structured JSON responses
  - Log actions and errors

Micromart API
  - Provides planogram data
  - Accepts restock event submissions
```

---

## 4. MVP Data Flow

```text
1. Restocker manually starts a restock session at the kiosk.

2. Developer/user obtains:
   - site_id
   - restock_session_id
   - auth cookie/session

3. Backend loads cookie and default config from .env.

4. Mobile app calls:
   POST /session/start

5. Backend fetches planogram:
   GET /api/sites/{site_id}/planogram

6. Backend builds searchable inventory index.

7. User enters command in mobile app:
   "set fairlife to 5"

8. Mobile app sends command to backend:
   POST /commands

9. Backend parses command:
   productQuery = "fairlife"
   quantity = 5

10. Backend resolves productQuery to inventory item:
    Fairlife Chocolate -> site_inventory_id 294450

11. Backend posts restock event:
    POST /api/restocks/{restock_session_id}/events

12. Backend returns result to mobile app.

13. Mobile app displays:
    "Fairlife Chocolate set to 5"
```

---

## 5. Technology Stack

## Frontend

```text
React Native
Expo
TypeScript
```

### Why React Native / Expo

- Fastest path to a real mobile MVP.
- Easy to run on an iPhone during development.
- Simple HTTP communication with backend.
- Fast UI iteration.
- Supports typed code with TypeScript.
- Can later support voice input, camera scanning, and native device features.

## Backend

```text
Node.js
TypeScript
Fastify
Axios or native fetch
dotenv
```

### Why TypeScript Backend

- Same language as the mobile app.
- Strong typing for request/response contracts.
- Good for JSON-heavy API orchestration.
- Fast to build and refactor.
- Easy to integrate validation, logging, and service-layer structure.

Backend framework: **Fastify** (chosen). Fastify has strong TypeScript
ergonomics and good performance; Express was the alternative. The framework is
isolated to the composition root (`app.ts`) and the route adapters
(`routes/*.ts`) — controllers and services stay framework-agnostic, so the
choice does not leak into business logic.

---

## 6. Frontend Responsibilities

The mobile app should stay thin. It should not know how Micromart works internally.

### Screens

```text
1. Session Screen
   - Start Session button
   - Shows session ready/loading/error state
   - Shows item count after planogram loads

2. Command Screen
   - Text input
   - Submit button
   - Result message
   - Error message

3. Match Confirmation Screen
   - Appears when product match is ambiguous
   - Shows list of possible products
   - User taps the correct item
```

### Frontend Should Handle

- User input.
- Displaying backend responses.
- Loading states.
- Simple validation such as empty command text.
- Selecting from ambiguous product options.
- Showing success/failure messages.

### Frontend Should Not Handle

- Micromart auth cookies.
- Direct calls to Micromart.
- Planogram parsing.
- Product matching rules.
- Restock event payload construction.
- Retry logic.
- Audit logging.

---

## 7. Backend Responsibilities

The backend is the center of the system.

### Backend Should Handle

- Loading config from environment variables.
- Managing the active MVP restock session.
- Fetching the planogram.
- Transforming planogram data into internal inventory models.
- Building a searchable product index.
- Parsing restock commands.
- Matching product names to inventory items.
- Detecting ambiguous matches.
- Posting restock correction events.
- Handling API errors.
- Returning clean JSON responses to the mobile app.
- Logging all attempted corrections.

---

## 8. Suggested Backend Folder Structure

```text
backend/
  src/
    app.ts
    server.ts

    config/
      micromartConfig.ts
      env.ts

    routes/
      sessionRoutes.ts
      commandRoutes.ts
      inventoryRoutes.ts

    controllers/
      sessionController.ts
      commandController.ts
      inventoryController.ts

    services/
      sessionService.ts
      planogramService.ts
      inventoryIndexService.ts
      commandParser.ts
      inventoryResolver.ts
      restockService.ts
      auditLogService.ts

    clients/
      micromartClient.ts

    auth/
      authProvider.ts
      hardcodedCookieAuthProvider.ts

    models/
      inventoryItem.ts
      parsedCommand.ts
      restockEvent.ts
      apiResponses.ts

    utils/
      normalizeText.ts
      fuzzyMatch.ts
      logger.ts
```

---

## 9. Environment Configuration

Store sensitive and environment-specific values in `.env`.

```env
PORT=3000
MICROMART_BASE_URL=https://classic.micromart.com
MICROMART_COOKIE=replace_with_cookie
DEFAULT_SITE_ID=405c1a90-80c4-41ba-b874-0f28229ed636
DEFAULT_RESTOCK_SESSION_ID=replace_with_session_id
```

Important:

```text
Never commit .env to GitHub.
```

Add this to `.gitignore`:

```gitignore
.env
node_modules
.expo
dist
```

---

## 10. Auth Abstraction

Even though MVP uses a hardcoded cookie, auth should be abstracted from the beginning.

### Auth Provider Interface

```ts
export interface AuthProvider {
  getAuthHeaders(): Promise<Record<string, string>>;
}
```

### MVP Implementation

```ts
export class HardcodedCookieAuthProvider implements AuthProvider {
  async getAuthHeaders(): Promise<Record<string, string>> {
    return {
      Cookie: process.env.MICROMART_COOKIE ?? ""
    };
  }
}
```

### Future Implementation

```ts
export class LoginAuthProvider implements AuthProvider {
  async getAuthHeaders(): Promise<Record<string, string>> {
    // Future implementation:
    // - username/password login
    // - 2FA step
    // - session refresh
    // - secure session storage
    return {};
  }
}
```

This lets the rest of the backend depend on `AuthProvider` instead of caring how auth works.

---

## 11. Micromart Client

The `MicromartClient` is the only backend module that should know the exact external API endpoints.

### Responsibilities

```text
MicromartClient
  - getPlanogram(siteId)
  - postRestockEvent(restockSessionId, event)
```

### External Endpoints

```http
GET https://classic.micromart.com/api/sites/{site_id}/planogram
```

```http
POST https://classic.micromart.com/api/restocks/{restock_session_id}/events
```

### Restock Event Payload

```json
{
  "type": "correct",
  "quantity": 5,
  "site_inventory_id": 294450
}
```

---

## 12. Inventory Data Model

Avoid reducing the planogram to only `{ name: siteId }`. The MVP should keep a richer model to support duplicates, aliases, disambiguation, and future features.

```ts
export type InventoryItem = {
  siteInventoryId: number;
  displayName: string;
  normalizedName: string;
  aliases: string[];
  recipeId?: string | number;
  cellId?: string | number;
  position?: string;
};
```

### Inventory Index

```ts
export type InventoryIndex = {
  byId: Map<number, InventoryItem>;
  byName: Map<string, InventoryItem[]>;
  allItems: InventoryItem[];
};
```

### Planogram Extraction

From the planogram response, extract values roughly like:

```text
site_inventory_id -> cells[].site_inventory.id
inventory_name    -> cells[].site_inventory.inventory.recipe.name
```

Then transform into internal `InventoryItem` records.

---

## 13. Command Parsing

Start with simple command patterns. Do not overbuild NLP at the beginning.

### Supported MVP Commands

```text
set fairlife to 5
fairlife 5
correct fairlife 5
make fairlife 5
```

### Parser Output

```ts
export type ParsedCommand = {
  action: "correct";
  productQuery: string;
  quantity: number;
};
```

Example:

```text
set fairlife to 5
```

becomes:

```json
{
  "action": "correct",
  "productQuery": "fairlife",
  "quantity": 5
}
```

### Parser Failure Cases

Return an error when:

- No quantity is found.
- Quantity is not a number.
- Product name is empty.
- Command does not match supported patterns.

Example response:

```json
{
  "status": "error",
  "message": "Could not understand command. Try something like 'set fairlife to 5'."
}
```

---

## 14. Product Matching Strategy

Use a layered matching approach.

```text
1. Exact normalized name match
2. Alias match
3. Contains/includes match
4. Fuzzy match
5. Return ambiguity if multiple good matches exist
6. Return not found if no reasonable match exists
```

### Normalization

Normalize both product names and user input.

```text
Fairlife Chocolate 14oz -> fairlife chocolate 14oz
"set FairLife to 5"    -> fairlife
```

Basic normalization:

- Lowercase.
- Trim whitespace.
- Remove extra spaces.
- Optionally remove punctuation.

### Ambiguous Match Example

User command:

```text
set fairlife to 5
```

Possible matches:

```text
Fairlife Chocolate
Fairlife Vanilla
Fairlife Strawberry
```

Backend response:

```json
{
  "status": "needs_confirmation",
  "message": "Which item did you mean?",
  "options": [
    {
      "name": "Fairlife Chocolate",
      "siteInventoryId": 294450
    },
    {
      "name": "Fairlife Vanilla",
      "siteInventoryId": 294451
    },
    {
      "name": "Fairlife Strawberry",
      "siteInventoryId": 294452
    }
  ],
  "quantity": 5
}
```

---

## 15. Backend API Contract

The mobile app should only talk to the backend API.

## POST /session/start

Initializes the MVP session and fetches the planogram.

### Request

For the first MVP, request body can be optional if using defaults from `.env`.

```json
{
  "siteId": "405c1a90-80c4-41ba-b874-0f28229ed636",
  "restockSessionId": "abc123"
}
```

### Response

```json
{
  "status": "ready",
  "siteId": "405c1a90-80c4-41ba-b874-0f28229ed636",
  "restockSessionId": "abc123",
  "itemCount": 128
}
```

---

## GET /inventory/search?q=fairlife

Debug/search endpoint for testing product matching.

### Response

```json
{
  "matches": [
    {
      "name": "Fairlife Chocolate",
      "siteInventoryId": 294450
    }
  ]
}
```

---

## POST /commands

Main command endpoint.

### Request

```json
{
  "text": "set fairlife to 5"
}
```

### Success Response

```json
{
  "status": "success",
  "message": "Fairlife Chocolate set to 5",
  "item": {
    "name": "Fairlife Chocolate",
    "siteInventoryId": 294450
  },
  "quantity": 5
}
```

### Ambiguous Response

```json
{
  "status": "needs_confirmation",
  "message": "Which item did you mean?",
  "options": [
    {
      "name": "Fairlife Chocolate",
      "siteInventoryId": 294450
    },
    {
      "name": "Fairlife Vanilla",
      "siteInventoryId": 294451
    }
  ],
  "quantity": 5
}
```

### Error Response

```json
{
  "status": "error",
  "message": "No matching inventory item found for 'fairlife'."
}
```

---

## POST /commands/confirm

Used when `/commands` returns `needs_confirmation`.

### Request

```json
{
  "siteInventoryId": 294450,
  "quantity": 5
}
```

### Response

```json
{
  "status": "success",
  "message": "Fairlife Chocolate set to 5",
  "item": {
    "name": "Fairlife Chocolate",
    "siteInventoryId": 294450
  },
  "quantity": 5
}
```

---

## 16. Restock Event Service

The `RestockService` is responsible for turning validated app intent into the correct Micromart API payload.

### Input

```ts
{
  siteInventoryId: 294450,
  quantity: 5
}
```

### Output Payload

```json
{
  "type": "correct",
  "quantity": 5,
  "site_inventory_id": 294450
}
```

### Responsibilities

- Validate quantity.
- Validate site inventory item exists.
- Build correct payload.
- Call `MicromartClient.postRestockEvent()`.
- Log result.
- Return clean success/error response.

---

## 17. Error Handling

The MVP should handle the most likely failures.

### Common Failure Cases

```text
Session not started
Planogram fetch failed
Auth cookie expired
Product not found
Product match ambiguous
Invalid command format
Invalid quantity
Micromart POST failed
Network failure
Unexpected internal error
```

The error `code` values are: `SESSION_NOT_READY`, `AUTH_EXPIRED`,
`INVALID_QUANTITY`, `UNPARSEABLE_COMMAND`, `PRODUCT_NOT_FOUND`,
`PLANOGRAM_FETCH_FAILED`, `MICROMART_POST_FAILED`, `NETWORK_ERROR`, and
`INTERNAL_ERROR`. `INTERNAL_ERROR` is the catch-all returned by the app's
last-resort error handler for any unexpected/unhandled fault (a bug, or a
collaborator that threw a non-typed error); controllers return the specific
codes. Its response includes the real error message to keep failures
debuggable.

### Example Error Responses

```json
{
  "status": "error",
  "code": "SESSION_NOT_READY",
  "message": "Start a restock session before sending commands."
}
```

```json
{
  "status": "error",
  "code": "AUTH_EXPIRED",
  "message": "Micromart session appears to be expired. Refresh the cookie and restart the backend."
}
```

```json
{
  "status": "error",
  "code": "INVALID_QUANTITY",
  "message": "Quantity must be a non-negative number."
}
```

```json
{
  "status": "error",
  "code": "INTERNAL_ERROR",
  "message": "Not implemented: InventoryIndexService.build"
}
```

---

## 18. Audit Logging

Even for an MVP, log every attempted correction. This is useful for debugging and safer testing.

### Log Fields

```ts
type AuditLogEntry = {
  timestamp: string;
  commandText?: string;
  parsedProductQuery?: string;
  matchedItemName?: string;
  siteInventoryId?: number;
  quantity?: number;
  status: "success" | "error" | "needs_confirmation";
  errorMessage?: string;
};
```

For MVP, this can be simple console logging or a local JSON file. Later it can move to SQLite or Postgres.

---

## 19. Frontend App Flow

### Session Screen

```text
User opens app
  -> taps Start Session
  -> app calls POST /session/start
  -> backend fetches planogram
  -> app shows Ready, item count, and command input
```

### Command Screen

```text
User enters "set fairlife to 5"
  -> app calls POST /commands
  -> app shows success, error, or match confirmation
```

### Match Confirmation Screen

```text
Backend returns needs_confirmation
  -> app shows matching products
  -> user taps the correct product
  -> app calls POST /commands/confirm
  -> app shows final success/error
```

---

## 20. Suggested Frontend Folder Structure

```text
frontend/
  app/
    App.tsx

  src/
    api/
      backendClient.ts

    screens/
      SessionScreen.tsx
      CommandScreen.tsx
      MatchConfirmationScreen.tsx

    components/
      CommandInput.tsx
      ResultBanner.tsx
      MatchOptionList.tsx

    types/
      api.ts
      inventory.ts

    utils/
      formatError.ts
```

---

## 21. MVP Milestones

## Milestone 1: Backend API Loop

Goal: prove the backend can talk to Micromart.

Tasks:

- Set up TypeScript backend.
- Add `.env` config.
- Implement `HardcodedCookieAuthProvider`.
- Implement `MicromartClient.getPlanogram()`.
- Implement `MicromartClient.postRestockEvent()`.
- Add basic `/session/start` route.
- Add basic `/commands` route with hardcoded item for first test.

Success criteria:

```text
Backend can fetch planogram and submit one known correction event.
```

---

## Milestone 2: Planogram Parsing + Inventory Index

Goal: turn real planogram response into searchable inventory data.

Tasks:

- Extract `site_inventory_id`.
- Extract inventory display name.
- Normalize names.
- Build `InventoryItem[]`.
- Build inventory index.
- Add `/inventory/search` debug endpoint.

Success criteria:

```text
Searching "fairlife" returns relevant planogram items.
```

---

## Milestone 3: Command Parser

Goal: support simple user text commands.

Tasks:

- Parse `set {product} to {quantity}`.
- Parse `{product} {quantity}`.
- Validate quantity.
- Return helpful errors.

Success criteria:

```text
"set fairlife to 5" returns productQuery="fairlife" and quantity=5.
```

---

## Milestone 4: Product Resolver

Goal: resolve product query to inventory item.

Tasks:

- Exact match.
- Includes match.
- Alias match.
- Basic fuzzy match.
- Ambiguity response.

Success criteria:

```text
The backend can distinguish success, no match, and multiple possible matches.
```

---

## Milestone 5: Mobile App MVP

Goal: create usable mobile UI.

Tasks:

- Set up Expo app.
- Build Session screen.
- Build Command screen.
- Call backend APIs.
- Display success/error.
- Build ambiguous-match selection UI.

Success criteria:

```text
From a phone, user can start session, type a command, and submit a correction.
```

---

## Milestone 6: Reliability + Safety

Goal: make MVP safer to test.

Tasks:

- Add audit logging.
- Add better error codes.
- Detect auth expiration.
- Add session reset route.
- Add confirmation for ambiguous/low-confidence matches.
- Prevent obviously invalid quantities.

Success criteria:

```text
The system fails safely and gives understandable feedback.
```

---

## Milestone 7: Future Auth Replacement

Goal: replace hardcoded cookie with real auth later.

Tasks:

- Add real `LoginAuthProvider`.
- Add login UI.
- Add 2FA-aware flow if required.
- Store short-lived sessions securely.
- Add logout/session expiration.

Success criteria:

```text
Hardcoded cookie can be removed without rewriting command, planogram, or restock logic.
```

---

## 22. Future Enhancements

After the real MVP works, possible improvements include:

```text
Voice input
Barcode scanning
Recent command history
Undo/revert correction
Multiple active sessions
Multiple sites
Real login support
2FA support
Persistent audit database
Admin dashboard
Product aliases managed from UI
Offline command queue
Better fuzzy matching
Role-based access
```

---

## 23. Key Architecture Principle

The most important design choice is keeping the frontend decoupled from Micromart.

```text
Frontend sends user intent.
Backend owns business logic.
MicromartClient owns external API details.
AuthProvider owns authentication details.
```

This keeps the MVP simple while leaving room for real production architecture later.

---

## 24. Final Recommended MVP Build

Build the first version in this order:

```text
1. TypeScript backend
2. Hardcoded cookie auth provider
3. Micromart planogram fetch
4. Inventory index
5. Command parser
6. Product resolver
7. Restock event poster
8. Expo mobile frontend
9. Ambiguous-match UI
10. Audit logging and error handling
```

Recommended final MVP stack:

```text
Mobile: React Native / Expo / TypeScript
Backend: Node.js / TypeScript / Fastify
Config: dotenv
External API client: fetch or Axios
Initial storage: in-memory
Later storage: SQLite or Postgres
```

The MVP should prove this complete loop:

```text
Start session -> fetch planogram -> enter command -> resolve item -> submit correction -> show result
```
