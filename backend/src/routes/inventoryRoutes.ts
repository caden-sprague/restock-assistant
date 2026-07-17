/**
 * routes/inventoryRoutes.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §15 GET /inventory/search
 */

import type { FastifyInstance } from "fastify";
import type { InventoryController } from "../controllers/inventoryController";
import { httpStatusFor } from "./httpStatus";

export function registerInventoryRoutes(
    app: FastifyInstance,
    controller: InventoryController,
): void {
    app.get<{ Querystring: { q?: string } }>(
        "/inventory/search",
        async (req, reply) => {
            const body = await controller.search(req.query.q ?? "");
            return reply.code(httpStatusFor(body)).send(body);
        },
    );
}
