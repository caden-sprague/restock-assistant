/**
 * utils/fuzzyMatch.test.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §14 Product Matching Strategy (layer 4: fuzzy)
 *
 * Unit tests for fuzzyScore(): the Levenshtein-based similarity score used as
 * InventoryResolver's last matching layer. Wrong scores here mean products
 * either fail to match when they should, or match when they shouldn't.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { fuzzyScore } from "./fuzzyMatch";

function assertInUnitRange(score: number) {
    assert.ok(
        score >= 0 && score <= 1,
        `expected score in [0, 1], got ${score}`,
    );
}

test("both strings empty returns 1", () => {
    const score = fuzzyScore("", "");
    assertInUnitRange(score);
    assert.equal(score, 1);
});

test("one string empty returns 0", () => {
    const score = fuzzyScore("fairlife", "");
    assertInUnitRange(score);
    assert.equal(score, 0);
});

test("identical strings return 1", () => {
    const score = fuzzyScore("fairlife", "fairlife");
    assertInUnitRange(score);
    assert.equal(score, 1);
});

test("one character difference scores close to 1", () => {
    // "fairlife" vs "fairlifs": single substitution out of 8 chars.
    const score = fuzzyScore("fairlife", "fairlifs");
    assertInUnitRange(score);
    assert.equal(score, 0.875);
    assert.ok(score > 0.8);
});

test("completely different strings score close to 0", () => {
    // Same length, every character differs -> full substitution distance.
    const score = fuzzyScore("abcdefgh", "zyxwvuts");
    assertInUnitRange(score);
    assert.equal(score, 0);
});

test('"fairlif" vs "fairlife" scores above the 0.6 resolver threshold', () => {
    const score = fuzzyScore("fairlif", "fairlife");
    assertInUnitRange(score);
    assert.ok(score > 0.6);
});

test("short gibberish vs a real word scores below the 0.6 resolver threshold", () => {
    const score = fuzzyScore("xqz", "fairlife");
    assertInUnitRange(score);
    assert.ok(score < 0.6);
});

test("score is always between 0 and 1 inclusive across varied input pairs", () => {
    const pairs: Array<[string, string]> = [
        ["", "a"],
        ["a", ""],
        ["a", "a"],
        ["fairlife", "sprite"],
        ["red bull", "redbull"],
        ["snickers", "snikers"],
        ["a very long product name here", "x"],
        ["!!!", "???"],
    ];

    for (const [a, b] of pairs) {
        assertInUnitRange(fuzzyScore(a, b));
    }
});

test("inputs are not mutated", () => {
    const a = "fairlife";
    const b = "fairlyfe";

    fuzzyScore(a, b);

    assert.equal(a, "fairlife");
    assert.equal(b, "fairlyfe");
});

test("no normalization happens inside fuzzyScore: differing case is not treated as identical", () => {
    const score = fuzzyScore("Fairlife", "fairlife");
    assertInUnitRange(score);
    assert.notEqual(score, 1);
    assert.equal(score, 0.875);
});
