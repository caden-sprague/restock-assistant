/**
 * services/inventoryIndexService.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §12 Inventory Data Model, Milestone 2
 *
 * Turns a raw planogram into a searchable InventoryIndex. Pure transformation —
 * no I/O, no state.
 */

import type { Planogram } from "../clients/micromartClient";
import type { InventoryIndex, InventoryItem } from "../models/inventoryItem";
import { normalizeText } from "../utils/normalizeText";

export class InventoryIndexService {
    /**
     * Extract InventoryItem[] from the planogram (§12: site_inventory.id and
     * site_inventory.inventory.recipe.name — UNVERIFIED shape), normalize names,
     * then build byId / byName / allItems.
     *
     * The real Micromart response shape is still unverified (see
     * clients/micromartClient.ts), so every field access below is defensive:
     * malformed/missing data drops that one cell rather than throwing.
     */
    build(planogram: Planogram): InventoryIndex {
        const byId = new Map<number, InventoryItem>();
        const byName = new Map<string, InventoryItem[]>();
        const allItems: InventoryItem[] = [];

        const cells = isRecord(planogram) && Array.isArray(planogram.cells)
            ? planogram.cells
            : [];

        for (const cell of cells) {
            const item = extractItem(cell);
            if (!item) continue;

            byId.set(item.siteInventoryId, item);

            const bucket = byName.get(item.normalizedName);
            if (bucket) {
                bucket.push(item);
            } else {
                byName.set(item.normalizedName, [item]);
            }

            allItems.push(item);
        }

        return { byId, byName, allItems };
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const n = Number(value);
        return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
}

/** string | number, matching InventoryItem's recipeId/cellId types. */
function toStringOrNumber(value: unknown): string | number | undefined {
    if (typeof value === "number" || typeof value === "string") return value;
    return undefined;
}

function extractItem(cell: unknown): InventoryItem | null {
    if (!isRecord(cell)) return null;

    const siteInventory = cell.site_inventory;
    if (!isRecord(siteInventory)) return null; // §-mandated skip: null/undefined site_inventory

    const siteInventoryId = toFiniteNumber(siteInventory.id);
    if (siteInventoryId === undefined) return null;

    const inventory = isRecord(siteInventory.inventory)
        ? siteInventory.inventory
        : undefined;
    const recipe = inventory && isRecord(inventory.recipe)
        ? inventory.recipe
        : undefined;

    const displayName =
        recipe && typeof recipe.name === "string" && recipe.name.trim() !== ""
            ? recipe.name
            : undefined;
    // Without a name there is nothing for the resolver to match against.
    if (!displayName) return null;

    const normalizedName = normalizeText(displayName);
    if (!normalizedName) return null;

    const position =
        typeof cell.position === "string" ? cell.position : undefined;

    return {
        siteInventoryId,
        displayName,
        normalizedName,
        aliases: [],
        recipeId: toStringOrNumber(recipe?.id),
        cellId: toStringOrNumber(cell.id) ?? position,
        position,
    };
}
