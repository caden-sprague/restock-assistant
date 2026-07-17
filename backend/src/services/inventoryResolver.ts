/**
 * services/inventoryResolver.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §14 Product Matching Strategy, Milestone 4
 *
 * Maps a productQuery to an InventoryItem using LAYERED matching:
 *   1. exact normalized name  2. alias  3. contains  4. fuzzy
 * Returns ambiguity when multiple good matches exist, not_found otherwise.
 */

import type { InventoryIndex, InventoryItem } from "../models/inventoryItem";

export type ResolveResult =
    | { kind: "single"; item: InventoryItem }
    | { kind: "ambiguous"; options: InventoryItem[] }
    | { kind: "not_found" };

export class InventoryResolver {
    resolve(_query: string, _index: InventoryIndex): ResolveResult {
        throw new Error("Not implemented: InventoryResolver.resolve");
    }
}
