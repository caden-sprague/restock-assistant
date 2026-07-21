/**
 * app.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §8, §23 (wiring)
 *
 * Composition root: builds the dependency graph (auth → client → services →
 * controllers) and registers routes on a Fastify instance (§5). This is the
 * only place the object graph is assembled; nothing else calls `new` on a
 * service. Swapping HardcodedCookieAuthProvider for a real LoginAuthProvider
 * later is a one-line change here.
 */

import Fastify, { type FastifyInstance } from "fastify";

import type { Env } from "./config/env";
import { createMicromartConfig } from "./config/micromartConfig";
import { HardcodedCookieAuthProvider } from "./auth/hardcodedCookieAuthProvider";
import { MicromartClient } from "./clients/micromartClient";

import { PlanogramService } from "./services/planogramService";
import { InventoryIndexService } from "./services/inventoryIndexService";
import { SessionService } from "./services/sessionService";
import { CommandParser } from "./services/commandParser";
import { InventoryResolver } from "./services/inventoryResolver";
import { AuditLogService } from "./services/auditLogService";
import { RestockService } from "./services/restockService";

import { SessionController } from "./controllers/sessionController";
import { CommandController } from "./controllers/commandController";
import { InventoryController } from "./controllers/inventoryController";

import { registerSessionRoutes } from "./routes/sessionRoutes";
import { registerCommandRoutes } from "./routes/commandRoutes";
import { registerInventoryRoutes } from "./routes/inventoryRoutes";
import { httpStatusFor } from "./routes/httpStatus";
import type { ErrorResponse } from "./models/apiResponses";
import { logger } from "./utils/logger";

export function createApp(env: Env): FastifyInstance {
    // Auth → client. MicromartClient is the ONLY Micromart-aware layer; it reads
    // headers from the AuthProvider, never the cookie directly.
    const auth = new HardcodedCookieAuthProvider(env.micromartCookie);
    const micromartConfig = createMicromartConfig(env.micromartBaseUrl);
    const micromart = new MicromartClient(auth, micromartConfig);

    // Services.
    const planograms = new PlanogramService(micromart);
    const indexer = new InventoryIndexService();
    const sessions = new SessionService(planograms, indexer);
    const parser = new CommandParser();
    const resolver = new InventoryResolver();
    const audit = new AuditLogService();
    const restock = new RestockService(micromart, sessions, audit);

    // Controllers.
    const sessionController = new SessionController(sessions, {
        siteId: env.defaultSiteId,
        restockSessionId: env.defaultRestockSessionId,
    });
    const commandController = new CommandController(
        parser,
        resolver,
        restock,
        sessions,
        audit,
    );
    const inventoryController = new InventoryController(sessions, resolver);

    // Fastify app. `logger: false` — we use utils/logger for diagnostics and
    // AuditLogService for business records (§7, §18); no pino noise.
    const app = Fastify({ logger: false });

    app.get("/health", async () => ({ status: "ok" }));

    registerSessionRoutes(app, sessionController);
    registerCommandRoutes(app, commandController);
    registerInventoryRoutes(app, inventoryController);

    // Last-resort handler for anything a controller lets throw (e.g. an
    // unexpected service failure). Known outcomes are returned as typed
    // ErrorResponse bodies by the controllers themselves; this maps everything
    // else to the INTERNAL_ERROR code (§17) and surfaces the real message so a
    // failure is debuggable from the response, not just the server log. The
    // full error (incl. stack) still goes to logger.error.
    //
    // TODO(Caden): the real error message is returned in EVERY environment,
    // which is fine for the single-user, non-public MVP. Before this backend is
    // deployed anywhere reachable, gate the detailed message behind a NODE_ENV
    // check (dev → real message; prod → generic "Internal server error.") so
    // internal details/stacks aren't leaked to clients.
    app.setErrorHandler((err, _req, reply) => {
        logger.error("Unhandled request error", err);
        const body: ErrorResponse = {
            status: "error",
            code: "INTERNAL_ERROR",
            message: err instanceof Error ? err.message : String(err),
        };
        reply.code(httpStatusFor(body)).send(body);
    });

    return app;
}
