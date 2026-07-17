/**
 * services/inventoryIndexService.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §12 Inventory Data Model, Milestone 2
 *
 * Turns a raw planogram into a searchable InventoryIndex. Pure transformation —
 * no I/O, no state.
 */

import type { Planogram } from "../clients/micromartClient";
import type { InventoryIndex } from "../models/inventoryItem";

export class InventoryIndexService {
    /**
     * Extract InventoryItem[] from the planogram (§12: site_inventory.id and
     * site_inventory.inventory.recipe.name — UNVERIFIED shape), normalize names,
     * then build byId / byName / allItems.
     */
    build(_planogram: Planogram): InventoryIndex {
        throw new Error("Not implemented: InventoryIndexService.build");
    }
}
