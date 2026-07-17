/**
 * models/restockEvent.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §11 Micromart Client, §16 Restock Event Service
 *
 * Exact Micromart payload shape. Only RestockService builds this; only
 * MicromartClient sends it.
 */

export type RestockEvent = {
    type: "correct";
    quantity: number;
    site_inventory_id: number;
};
