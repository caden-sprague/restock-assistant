# Backend Ownership

Per [`../CLAUDE.md`](../CLAUDE.md) and the MVP plan §8. Devin owns the mobile app (`mobile/`, plan §20) — not stubbed here.

| File | Owner | Plan |
|------|-------|------|
| `src/app.ts` | Caden | §8 |
| `src/server.ts` | Caden | §8 |
| `src/config/env.ts` | Caden | §9 |
| `src/config/micromartConfig.ts` | Caden | §11 |
| `src/routes/sessionRoutes.ts` | Caden | §15 |
| `src/routes/commandRoutes.ts` | Caden | §15 |
| `src/routes/inventoryRoutes.ts` | Joel | §15 |
| `src/controllers/sessionController.ts` | Caden | §15 |
| `src/controllers/commandController.ts` | Caden | §15 |
| `src/controllers/inventoryController.ts` | Joel | §15 |
| `src/services/sessionService.ts` | Caden | §7 |
| `src/services/planogramService.ts` | Caden | §12 |
| `src/services/restockService.ts` | Caden | §16 |
| `src/services/auditLogService.ts` | Caden | §18 |
| `src/services/inventoryIndexService.ts` | Joel | §12 |
| `src/services/commandParser.ts` | Joel | §13 |
| `src/services/inventoryResolver.ts` | Joel | §14 |
| `src/clients/micromartClient.ts` | Caden | §11 |
| `src/auth/authProvider.ts` | Caden | §10 |
| `src/auth/hardcodedCookieAuthProvider.ts` | Caden | §10 |
| `src/models/inventoryItem.ts` | Joel | §12 |
| `src/models/parsedCommand.ts` | Joel | §13 |
| `src/models/restockEvent.ts` | Caden | §11 |
| `src/models/apiResponses.ts` | Caden | §15, §17 |
| `src/utils/normalizeText.ts` | Joel | §14 |
| `src/utils/fuzzyMatch.ts` | Joel | §14 |
| `src/utils/logger.ts` | Caden | §7 |

> Controllers/routes are wired to a framework (Express or Fastify — plan §5, undecided).
> Stubs are framework-agnostic so that choice stays open.
