/**
 * services/commandParser.test.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §13 Command Parsing, Milestone 3
 *
 * Unit tests for CommandParser.parse(): the four supported forms, the
 * trailing-quantity anchoring that lets product names contain numbers, the
 * ParseError failure cases (§13), and that productQuery comes back normalized.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { CommandParser, ParseError } from "./commandParser";

const parser = new CommandParser();

test('"set fairlife to 5" parses to action correct, product fairlife, quantity 5', () => {
    assert.deepEqual(parser.parse("set fairlife to 5"), {
        action: "correct",
        productQuery: "fairlife",
        quantity: 5,
    });
});


test('"set fairlife 5" parses to action correct, product fairlife, quantity 5', () => {
    assert.deepEqual(parser.parse("set fairlife 5"), {
        action: "correct",
        productQuery: "fairlife",
        quantity: 5,
    });
});

test('"fairlife 5" (bare form) parses the same as the keyword forms', () => {
    assert.deepEqual(parser.parse("fairlife 5"), {
        action: "correct",
        productQuery: "fairlife",
        quantity: 5,
    });
});

test('"correct fairlife 5" parses to action correct, product fairlife, quantity 5', () => {
    assert.deepEqual(parser.parse("correct fairlife 5"), {
        action: "correct",
        productQuery: "fairlife",
        quantity: 5,
    });
});

test('"make fairlife 5" parses to action correct, product fairlife, quantity 5', () => {
    assert.deepEqual(parser.parse("make fairlife 5"), {
        action: "correct",
        productQuery: "fairlife",
        quantity: 5,
    });
});

// The "correct"/"make" patterns don't account for an optional "to", so their
// greedy (.+) swallows it into the product name. These pin the mixed phrasing
// a stocker is likely to type.
test('"correct fairlife to 5" drops the "to" rather than folding it into the product name', () => {
    assert.deepEqual(parser.parse("correct fairlife to 5"), {
        action: "correct",
        productQuery: "fairlife",
        quantity: 5,
    });
});

test('"correct fairlife 5" drops the "to" rather than folding it into the product name', () => {
    assert.deepEqual(parser.parse("correct fairlife to 5"), {
        action: "correct",
        productQuery: "fairlife",
        quantity: 5,
    });
});

test('"make fairlife to 5" drops the "to" rather than folding it into the product name', () => {
    assert.deepEqual(parser.parse("make fairlife to 5"), {
        action: "correct",
        productQuery: "fairlife",
        quantity: 5,
    });
});

test('a product name legitimately ending in "to" survives the optional-"to" strip', () => {
    // Only ONE trailing "to" is optional, so the name's own "to" is kept.
    assert.deepEqual(parser.parse("correct pocari to to 5"), {
        action: "correct",
        productQuery: "pocari to",
        quantity: 5,
    });
});

test('product name with an embedded number ("fairlife 14oz 5") anchors quantity as the trailing token', () => {
    assert.deepEqual(parser.parse("fairlife 14oz 5"), {
        action: "correct",
        productQuery: "fairlife 14oz",
        quantity: 5,
    });
});

test("float quantity throws ParseError", () => {
    assert.throws(() => parser.parse("fairlife 5.5"), ParseError);
});

test("non-numeric quantity throws ParseError", () => {
    assert.throws(() => parser.parse("fairlife abc"), ParseError);
});

test("negative quantity is parsed through, not rejected by the parser", () => {
    const result = parser.parse("fairlife -1");
    assert.deepEqual(result, {
        action: "correct",
        productQuery: "fairlife",
        quantity: -1,
    });
});

test("empty product query throws ParseError", () => {
    assert.throws(() => parser.parse("set to 5"), ParseError);
});

test("unrecognized pattern throws ParseError", () => {
    assert.throws(() => parser.parse("gibberish"), ParseError);
});

test("thrown errors are specifically ParseError, not a generic Error", () => {
    try {
        parser.parse("gibberish");
        assert.fail("expected parse() to throw");
    } catch (err) {
        assert.ok(err instanceof ParseError);
        assert.equal(err instanceof Error, true);
    }
});

test("productQuery is normalized (lowercased, punctuation stripped) before returning", () => {
    const result = parser.parse("set FairLife, Chocolate to 5");
    assert.equal(result.productQuery, "fairlife chocolate");
});
