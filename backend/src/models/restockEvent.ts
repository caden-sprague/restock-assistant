/**
 * models/restockEvent.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §11 Micromart Client, §16 Restock Event Service
 *
 * Exact Micromart payload shape. Only RestockService builds this; only
 * MicromartClient sends it.
 */

export class RestockEvent {
    /**
     * Always "correct" for the MVP — the only event Micromart accepts here
     * (§16). The constructor fills it in so callers supply just the quantity
     * and target item; the field is public + readonly so JSON.stringify emits
     * the exact wire shape { type, quantity, site_inventory_id }.
     */
    readonly type = "correct" as const;

    constructor(
        readonly quantity: number,
        readonly site_inventory_id: number,
    ) {}
}