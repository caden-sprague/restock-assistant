/**
 * routes/sessionRoutes.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 POST /session/start
 *
 * Wires Fastify (§5) to SessionController. The controller is framework-agnostic
 * (takes a parsed input, returns a typed response); this file is the adapter.
 */

import type { FastifyInstance } from "fastify";
import type { SessionController } from "../controllers/sessionController";
import { httpStatusFor } from "./httpStatus";

export function registerSessionRoutes(
    app: FastifyInstance,
    controller: SessionController,
): void {
    app.post<{ Body: { siteId?: string; restockSessionId?: string } }>(
        "/session/start",
        async (req, reply) => {
            const body = await controller.startSession(req.body ?? {});
            return reply.code(httpStatusFor(body)).send(body);
        },
    );
}
