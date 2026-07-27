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
    // Schemas enforce STRUCTURE only (field presence + type). Semantic rules
    // stay in the services: quantity being a non-negative integer is the
    // service's INVALID_QUANTITY check, and a well-formed-but-unknown
    // siteInventoryId is its PRODUCT_NOT_FOUND check. A schema miss becomes
    // INVALID_REQUEST/400 via the app's error handler.
    app.post<{ Body: { text: string } }>(
        "/commands",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["text"],
                    properties: { text: { type: "string" } },
                    additionalProperties: false,
                },
            },
        },
        async (req, reply) => {
            const body = await controller.handleCommand(req.body);
            return reply.code(httpStatusFor(body)).send(body);
        },
    );

    app.post<{ Body: { siteInventoryId: number; quantity: number } }>(
        "/commands/confirm",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["siteInventoryId", "quantity"],
                    properties: {
                        siteInventoryId: { type: "integer" },
                        quantity: { type: "number" },
                    },
                    additionalProperties: false,
                },
            },
        },
        async (req, reply) => {
            const body = await controller.handleConfirm(req.body);
            return reply.code(httpStatusFor(body)).send(body);
        },
    );
}
