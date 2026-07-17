/**
 * routes/commandRoutes.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 POST /commands, POST /commands/confirm
 */

import type { CommandController } from "../controllers/commandController";

export function registerCommandRoutes(
    _app: unknown,
    _controller: CommandController,
): void {
    // TODO(Caden):
    //   POST /commands         -> controller.handleCommand(req.body)
    //   POST /commands/confirm -> controller.handleConfirm(req.body)
    throw new Error("Not implemented: registerCommandRoutes");
}
