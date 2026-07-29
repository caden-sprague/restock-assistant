/**
 * services/inventoryResolver.test.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §14 Product Matching Strategy, Milestone 4
 *
 * Unit tests for InventoryResolver.resolve(): each of the four layers
 * (exact -> alias -> contains -> fuzzy) tested in isolation, ambiguity when
 * a layer yields 2+ candidates, not_found when none do, and that layers are
 * strict — a hit at an earlier layer never gets diluted by a later one.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { InventoryResolver } from "./inventoryResolver";
import type { InventoryIndex, InventoryItem } from "../models/inventoryItem";
import { normalizeText } from "../utils/normalizeText";

const resolver = new InventoryResolver();

function makeItem(
    id: number,
    displayName: string,
    aliases: string[] = [],
): InventoryItem {
    return {
        siteInventoryId: id,
        displayName,
        normalizedName: normalizeText(displayName),
        aliases,
    };
}

function buildIndex(items: InventoryItem[]): InventoryIndex {
    const byId = new Map<number, InventoryItem>();
    const byName = new Map<string, InventoryItem[]>();

    for (const item of items) {
        byId.set(item.siteInventoryId, item);
        const bucket = byName.get(item.normalizedName);
        if (bucket) {
            bucket.push(item);
        } else {
            byName.set(item.normalizedName, [item]);
        }
    }

    return { byId, byName, allItems: items };
}

test("exact match on normalizedName returns kind: single", () => {
    const item = makeItem(1, "Fairlife Chocolate");
    const index = buildIndex([item]);

    const result = resolver.resolve("Fairlife Chocolate", index);

    assert.deepEqual(result, { kind: "single", item });
});

test("alias match returns kind: single", () => {
    const item = makeItem(1, "Coca Cola Classic", ["coke"]);
    const index = buildIndex([item]);

    const result = resolver.resolve("coke", index);

    assert.deepEqual(result, { kind: "single", item });
});

test("contains match (query inside normalizedName) returns kind: single", () => {
    const item = makeItem(1, "Fairlife Chocolate");
    const index = buildIndex([item]);

    const result = resolver.resolve("chocolate", index);

    assert.deepEqual(result, { kind: "single", item });
});

test("contains match (normalizedName inside query) returns kind: single", () => {
    const item = makeItem(1, "Sprite");
    const index = buildIndex([item]);

    const result = resolver.resolve("the sprite can", index);

    assert.deepEqual(result, { kind: "single", item });
});

test('fuzzy match on a typo ("fairlyfe") returns kind: single', () => {
    const item = makeItem(1, "Fairlife");
    const index = buildIndex([item]);

    // Transposed letters, not a truncation, so this can't be caught by the
    // contains layer — it must fall through to fuzzy.
    const result = resolver.resolve("fairlyfe", index);

    assert.deepEqual(result, { kind: "single", item });
});

test("exact collision (two items sharing a normalizedName) returns kind: ambiguous", () => {
    const a = makeItem(1, "Sprite");
    const b = makeItem(2, "Sprite");
    const index = buildIndex([a, b]);

    const result = resolver.resolve("Sprite", index);

    assert.deepEqual(result, { kind: "ambiguous", options: [a, b] });
});

test("multiple contains matches returns kind: ambiguous (the Fairlife example)", () => {
    const chocolate = makeItem(294450, "Fairlife Chocolate");
    const vanilla = makeItem(294451, "Fairlife Vanilla");
    const strawberry = makeItem(294452, "Fairlife Strawberry");
    const index = buildIndex([chocolate, vanilla, strawberry]);

    const result = resolver.resolve("fairlife", index);

    assert.deepEqual(result, {
        kind: "ambiguous",
        options: [chocolate, vanilla, strawberry],
    });
});

test("multiple fuzzy matches above threshold returns kind: ambiguous", () => {
    const a = makeItem(1, "Aaaa");
    const b = makeItem(2, "Aaab");
    const index = buildIndex([a, b]);

    // "aaac" is not an exact/alias/contains match for either, but scores
    // 0.75 against both (1 substitution out of 4 chars) — above threshold.
    const result = resolver.resolve("aaac", index);

    assert.equal(result.kind, "ambiguous");
    if (result.kind === "ambiguous") {
        assert.deepEqual(new Set(result.options), new Set([a, b]));
    }
});

test("no match at any layer returns kind: not_found", () => {
    const item = makeItem(1, "Fairlife");
    const index = buildIndex([item]);

    const result = resolver.resolve("zzzzzzzzzz", index);

    assert.deepEqual(result, { kind: "not_found" });
});

test("fuzzy score below the 0.6 threshold returns kind: not_found", () => {
    const item = makeItem(1, "Abcdefgh");
    const index = buildIndex([item]);

    // 4 of 8 characters differ -> score 0.5, below the 0.6 threshold.
    const result = resolver.resolve("abcdxxxx", index);

    assert.deepEqual(result, { kind: "not_found" });
});

test("empty query returns kind: not_found", () => {
    const item = makeItem(1, "Fairlife");
    const index = buildIndex([item]);

    assert.deepEqual(resolver.resolve("", index), { kind: "not_found" });
    assert.deepEqual(resolver.resolve("   ", index), { kind: "not_found" });
});

test("empty index returns kind: not_found", () => {
    const index = buildIndex([]);

    const result = resolver.resolve("anything", index);

    assert.deepEqual(result, { kind: "not_found" });
});

test("layers are strict: an exact match never falls through to include a fuzzy-close item", () => {
    const exact = makeItem(1, "Fairlife");
    const fuzzyClose = makeItem(2, "Fairlyfe");
    const index = buildIndex([exact, fuzzyClose]);

    // If fuzzy candidates leaked into an exact-layer result, this would come
    // back ambiguous with both items instead of single with just the exact one.
    const result = resolver.resolve("Fairlife", index);

    assert.deepEqual(result, { kind: "single", item: exact });
});
