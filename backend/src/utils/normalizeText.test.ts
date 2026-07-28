/**
 * utils/normalizeText.test.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §14 Product Matching Strategy (Normalization)
 *
 * Unit tests for normalizeText(). Every layer of InventoryResolver's matching
 * normalizes through this function first, so its edge cases (punctuation,
 * whitespace, empty/null input) matter well beyond this file.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeText } from "./normalizeText";

test("lowercases input", () => {
    assert.equal(normalizeText("FAIRLIFE"), "fairlife");
});

test("trims leading and trailing whitespace", () => {
    assert.equal(normalizeText("  fairlife  "), "fairlife");
});

test("collapses multiple internal spaces into one", () => {
    assert.equal(normalizeText("fairlife    chocolate"), "fairlife chocolate");
});

test("strips punctuation while preserving alphanumerics and spaces", () => {
    assert.equal(normalizeText("fairlife, chocolate."), "fairlife chocolate");
});

test("empty string returns empty string", () => {
    assert.equal(normalizeText(""), "");
});

test("whitespace-only string returns empty string", () => {
    assert.equal(normalizeText("   "), "");
});

test("null does not throw and returns empty string", () => {
    assert.doesNotThrow(() => normalizeText(null as unknown as string));
    assert.equal(normalizeText(null as unknown as string), "");
});

test("undefined does not throw and returns empty string", () => {
    assert.doesNotThrow(() => normalizeText(undefined as unknown as string));
    assert.equal(normalizeText(undefined as unknown as string), "");
});

test("mixed case with punctuation: 'Fairlife 14oz!' -> 'fairlife 14oz'", () => {
    assert.equal(normalizeText("Fairlife 14oz!"), "fairlife 14oz");
});

test("hyphenated words drop the hyphen without inserting a space", () => {
    assert.equal(normalizeText("sugar-free"), "sugarfree");
});

test("multiple punctuation types (commas, periods, exclamation marks) are all stripped", () => {
    assert.equal(
        normalizeText("Red Bull, sugar-free. Great!"),
        "red bull sugarfree great",
    );
});

test("digits are preserved", () => {
    assert.equal(normalizeText("Gatorade 20oz"), "gatorade 20oz");
});

test("already-normalized input is unchanged", () => {
    assert.equal(normalizeText("fairlife chocolate"), "fairlife chocolate");
});
