/**
 * routes/commandRoutes.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 POST /commands, POST /commands/confirm
 */

import type { FastifyInstance } from "fastify";
import type { CommandController } from "../controllers/commandController";
import { httpStatusFor } from "./httpStatus";

export function registerCommandRoutes(
    app: FastifyInstance,
    controller: CommandController,
): void {
    app.post<{ Body: { text: string } }>("/commands", async (req, reply) => {
        const body = await controller.handleCommand(req.body);
        return reply.code(httpStatusFor(body)).send(body);
    });

    app.post<{ Body: { siteInventoryId: number; quantity: number } }>(
        "/commands/confirm",
        async (req, reply) => {
            const body = await controller.handleConfirm(req.body);
            return reply.code(httpStatusFor(body)).send(body);
        },
    );
}
