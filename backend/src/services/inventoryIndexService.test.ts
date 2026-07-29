/**
 * services/inventoryIndexService.test.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §12 Inventory Data Model, Milestone 2
 *
 * Unit tests for InventoryIndexService.build(): correct field extraction from
 * a realistic planogram shape, byId/byName indexing, and that malformed cells
 * are skipped rather than thrown on (the real Micromart shape is unverified —
 * see clients/micromartClient.ts — so this defensiveness matters).
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { InventoryIndexService } from "./inventoryIndexService";
import type { Planogram } from "../clients/micromartClient";

const service = new InventoryIndexService();

function planogram(cells: unknown[]): Planogram {
    return { cells };
}

test("valid planogram with one cell produces one item in allItems", () => {
    const index = service.build(
        planogram([
            {
                id: "cell-A1",
                position: "A1",
                site_inventory: {
                    id: 294450,
                    inventory: {
                        recipe: { id: "r-294450", name: "Fairlife Chocolate" },
                    },
                },
            },
        ]),
    );

    assert.equal(index.allItems.length, 1);
});

test("siteInventoryId, displayName, normalizedName, aliases, recipeId, cellId all populate correctly", () => {
    const index = service.build(
        planogram([
            {
                id: "cell-A1",
                position: "A1",
                site_inventory: {
                    id: 294450,
                    inventory: {
                        recipe: { id: "r-294450", name: "Fairlife Chocolate" },
                    },
                },
            },
        ]),
    );

    assert.deepEqual(index.allItems[0], {
        siteInventoryId: 294450,
        displayName: "Fairlife Chocolate",
        normalizedName: "fairlife chocolate",
        aliases: [],
        recipeId: "r-294450",
        cellId: "cell-A1",
        position: "A1",
    });
});

test("normalizedName is the normalized version of displayName", () => {
    const index = service.build(
        planogram([
            {
                position: "B1",
                site_inventory: {
                    id: 1,
                    inventory: { recipe: { name: "Red Bull, Sugar-Free!" } },
                },
            },
        ]),
    );

    assert.equal(index.allItems[0].displayName, "Red Bull, Sugar-Free!");
    assert.equal(index.allItems[0].normalizedName, "red bull sugarfree");
});

test("cellId falls back to position when the cell has no id field", () => {
    const index = service.build(
        planogram([
            {
                position: "C1",
                site_inventory: {
                    id: 2,
                    inventory: { recipe: { name: "Sprite" } },
                },
            },
        ]),
    );

    assert.equal(index.allItems[0].cellId, "C1");
});

test("byId map contains the item keyed by siteInventoryId", () => {
    const index = service.build(
        planogram([
            {
                position: "A1",
                site_inventory: {
                    id: 294450,
                    inventory: { recipe: { name: "Fairlife Chocolate" } },
                },
            },
        ]),
    );

    const item = index.byId.get(294450);
    assert.ok(item);
    assert.equal(item?.displayName, "Fairlife Chocolate");
});

test("byName map contains the item keyed by normalizedName", () => {
    const index = service.build(
        planogram([
            {
                position: "A1",
                site_inventory: {
                    id: 294450,
                    inventory: { recipe: { name: "Fairlife Chocolate" } },
                },
            },
        ]),
    );

    const bucket = index.byName.get("fairlife chocolate");
    assert.ok(bucket);
    assert.equal(bucket?.length, 1);
    assert.equal(bucket?.[0].siteInventoryId, 294450);
});

test("cell with null site_inventory is skipped, not in allItems", () => {
    const index = service.build(
        planogram([{ position: "A2", site_inventory: null }]),
    );

    assert.equal(index.allItems.length, 0);
});

test("cell with missing site_inventory.id is skipped", () => {
    const index = service.build(
        planogram([
            {
                position: "A3",
                site_inventory: {
                    inventory: { recipe: { name: "No Id" } },
                },
            },
        ]),
    );

    assert.equal(index.allItems.length, 0);
});

test("cell with missing recipe name is skipped", () => {
    const index = service.build(
        planogram([
            {
                position: "A4",
                site_inventory: {
                    id: 3,
                    inventory: { recipe: {} },
                },
            },
        ]),
    );

    assert.equal(index.allItems.length, 0);
});

test("empty cells array returns an empty index without throwing", () => {
    assert.doesNotThrow(() => service.build(planogram([])));

    const index = service.build(planogram([]));
    assert.equal(index.allItems.length, 0);
    assert.equal(index.byId.size, 0);
    assert.equal(index.byName.size, 0);
});

test("null planogram returns an empty index without throwing", () => {
    assert.doesNotThrow(() => service.build(null as unknown as Planogram));

    const index = service.build(null as unknown as Planogram);
    assert.equal(index.allItems.length, 0);
    assert.equal(index.byId.size, 0);
    assert.equal(index.byName.size, 0);
});

test("undefined planogram returns an empty index without throwing", () => {
    assert.doesNotThrow(() => service.build(undefined as unknown as Planogram));

    const index = service.build(undefined as unknown as Planogram);
    assert.equal(index.allItems.length, 0);
    assert.equal(index.byId.size, 0);
    assert.equal(index.byName.size, 0);
});

test("multiple valid cells all appear in allItems, byId, and byName", () => {
    const index = service.build(
        planogram([
            {
                position: "A1",
                site_inventory: {
                    id: 294450,
                    inventory: { recipe: { name: "Fairlife Chocolate" } },
                },
            },
            {
                position: "B1",
                site_inventory: {
                    id: 300010,
                    inventory: { recipe: { name: "Sprite" } },
                },
            },
        ]),
    );

    assert.equal(index.allItems.length, 2);
    assert.ok(index.byId.get(294450));
    assert.ok(index.byId.get(300010));
    assert.ok(index.byName.get("fairlife chocolate"));
    assert.ok(index.byName.get("sprite"));
});
