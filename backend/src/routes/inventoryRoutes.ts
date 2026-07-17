/**
 * routes/inventoryRoutes.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §15 GET /inventory/search
 */

import type { InventoryController } from "../controllers/inventoryController";

export function registerInventoryRoutes(
    _app: unknown,
    _controller: InventoryController,
): void {
    // TODO(Joel): GET /inventory/search?q=... -> controller.search(req.query.q)
    throw new Error("Not implemented: registerInventoryRoutes");
}
