/**
 * routes/sessionRoutes.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 POST /session/start
 *
 * Wires the HTTP framework (Express or Fastify — §5, undecided) to
 * SessionController. `app` is typed `unknown` until the framework is chosen.
 */

import type { SessionController } from "../controllers/sessionController";

export function registerSessionRoutes(
    _app: unknown,
    _controller: SessionController,
): void {
    // TODO(Caden): POST /session/start -> controller.startSession(req.body)
    throw new Error("Not implemented: registerSessionRoutes");
}
