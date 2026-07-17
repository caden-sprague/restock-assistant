/**
 * controllers/inventoryController.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §15 GET /inventory/search?q=...
 *
 * Debug/search endpoint for testing product matching against the active index.
 */

import type { SessionService } from "../services/sessionService";
import type { InventoryResolver } from "../services/inventoryResolver";
import type { ItemRef, ErrorResponse } from "../models/apiResponses";

export type SearchResponse = { matches: ItemRef[] };

export class InventoryController {
    constructor(
        private readonly sessions: SessionService,
        private readonly resolver: InventoryResolver,
    ) {}

    async search(_query: string): Promise<SearchResponse | ErrorResponse> {
        throw new Error("Not implemented: InventoryController.search");
    }
}
