/**
 * models/inventoryItem.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §12 Inventory Data Model
 *
 * Rich inventory model — do NOT collapse to { name: id }. Duplicates,
 * aliases, and disambiguation depend on these fields.
 */

export type InventoryItem = {
    siteInventoryId: number;
    displayName: string;
    normalizedName: string;
    aliases: string[];
    recipeId?: string | number;
    cellId?: string | number;
    position?: string;
};

export type InventoryIndex = {
    /** siteInventoryId -> item */
    byId: Map<number, InventoryItem>;
    /** normalizedName -> items (array: names can collide) */
    byName: Map<string, InventoryItem[]>;
    allItems: InventoryItem[];
};
