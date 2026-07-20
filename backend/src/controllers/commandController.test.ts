/**
 * controllers/commandController.test.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 POST /commands
 *
 * Unit tests for CommandController.handleCommand's branching. Joel's parser and
 * resolver, plus the restock/session/audit collaborators, are faked so the
 * ORCHESTRATION is tested in isolation — not parsing, matching, or submission.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { CommandController } from "./commandController";
import { ParseError } from "../services/commandParser";
import type { CommandParser } from "../services/commandParser";
import type {
    InventoryResolver,
    ResolveResult,
} from "../services/inventoryResolver";
import type { RestockService } from "../services/restockService";
import type {
    SessionService,
    SessionState,
} from "../services/sessionService";
import type {
    AuditLogService,
    AuditLogEntry,
} from "../services/auditLogService";
import type {
    InventoryItem,
    InventoryIndex,
} from "../models/inventoryItem";
import type { ParsedCommand } from "../models/parsedCommand";
import type {
    CommandResponse,
    ErrorResponse,
    NeedsConfirmationResponse,
    SuccessResponse,
} from "../models/apiResponses";

// --- fixtures ---------------------------------------------------------------

function makeItem(siteInventoryId: number, displayName: string): InventoryItem {
    return {
        siteInventoryId,
        displayName,
        normalizedName: displayName.toLowerCase(),
        aliases: [],
    };
}

const EMPTY_INDEX: InventoryIndex = {
    byId: new Map(),
    byName: new Map(),
    allItems: [],
};

function makeSession(index: InventoryIndex = EMPTY_INDEX): SessionState {
    return {
        siteId: "site-1",
        restockSessionId: "restock-1",
        index,
        startedAt: "2026-07-20T00:00:00.000Z",
    };
}

type HarnessOpts = {
    /** undefined → active session; null → no session started */
    session?: SessionState | null;
    parse?: (text: string) => ParsedCommand;
    resolve?: (query: string, index: InventoryIndex) => ResolveResult;
    submit?: (
        siteInventoryId: number,
        quantity: number,
    ) => Promise<CommandResponse>;
};

function makeHarness(opts: HarnessOpts = {}) {
    const auditEntries: AuditLogEntry[] = [];
    const submitCalls: Array<{ siteInventoryId: number; quantity: number }> =
        [];
    let resolveCalls = 0;

    const parser = {
        parse:
            opts.parse ??
            (() => {
                throw new Error("parse not configured");
            }),
    } as unknown as CommandParser;

    const resolver = {
        resolve: (query: string, index: InventoryIndex) => {
            resolveCalls++;
            return opts.resolve
                ? opts.resolve(query, index)
                : ({ kind: "not_found" } as ResolveResult);
        },
    } as unknown as InventoryResolver;

    const restock = {
        submit: async (siteInventoryId: number, quantity: number) => {
            submitCalls.push({ siteInventoryId, quantity });
            return opts.submit
                ? opts.submit(siteInventoryId, quantity)
                : ({
                      status: "success",
                      message: "ok",
                      item: { name: "x", siteInventoryId },
                      quantity,
                  } as SuccessResponse);
        },
    } as unknown as RestockService;

    const sessions = {
        getActive: () =>
            opts.session === undefined ? makeSession() : opts.session,
    } as unknown as SessionService;

    const audit = {
        log: (entry: AuditLogEntry) => {
            auditEntries.push(entry);
        },
    } as unknown as AuditLogService;

    const controller = new CommandController(
        parser,
        resolver,
        restock,
        sessions,
        audit,
    );

    return {
        controller,
        auditEntries,
        submitCalls,
        resolveCalls: () => resolveCalls,
    };
}

function asError(res: CommandResponse): ErrorResponse {
    assert.equal(res.status, "error");
    return res as ErrorResponse;
}

const parsed = (productQuery: string, quantity: number): ParsedCommand => ({
    action: "correct",
    productQuery,
    quantity,
});

// --- tests ------------------------------------------------------------------

test("no active session → SESSION_NOT_READY, nothing submitted", async () => {
    const h = makeHarness({ session: null });
    const res = asError(await h.controller.handleCommand({ text: "set x to 5" }));
    assert.equal(res.code, "SESSION_NOT_READY");
    assert.equal(h.submitCalls.length, 0);
    assert.equal(h.auditEntries.at(-1)?.status, "error");
});

test("parser throws ParseError → UNPARSEABLE_COMMAND", async () => {
    const h = makeHarness({
        parse: () => {
            throw new ParseError("nope");
        },
    });
    const res = asError(await h.controller.handleCommand({ text: "???" }));
    assert.equal(res.code, "UNPARSEABLE_COMMAND");
    assert.equal(h.submitCalls.length, 0);
});

test("parser throws a non-ParseError → propagates to the 500 handler", async () => {
    const h = makeHarness({
        parse: () => {
            throw new Error("boom");
        },
    });
    await assert.rejects(
        () => h.controller.handleCommand({ text: "x" }),
        /boom/,
    );
});

test("negative quantity → INVALID_QUANTITY, resolver never called", async () => {
    const h = makeHarness({ parse: () => parsed("fairlife", -1) });
    const res = asError(
        await h.controller.handleCommand({ text: "set fairlife to -1" }),
    );
    assert.equal(res.code, "INVALID_QUANTITY");
    assert.equal(h.resolveCalls(), 0);
});

test("non-integer quantity → INVALID_QUANTITY", async () => {
    const h = makeHarness({ parse: () => parsed("fairlife", 2.5) });
    const res = asError(
        await h.controller.handleCommand({ text: "set fairlife to 2.5" }),
    );
    assert.equal(res.code, "INVALID_QUANTITY");
    assert.equal(h.resolveCalls(), 0);
});

test("resolver not_found → PRODUCT_NOT_FOUND naming the query", async () => {
    const h = makeHarness({
        parse: () => parsed("fairlife", 5),
        resolve: () => ({ kind: "not_found" }),
    });
    const res = asError(
        await h.controller.handleCommand({ text: "set fairlife to 5" }),
    );
    assert.equal(res.code, "PRODUCT_NOT_FOUND");
    assert.match(res.message, /fairlife/);
    assert.equal(h.submitCalls.length, 0);
});

test("resolver ambiguous → needs_confirmation with mapped options, no submit", async () => {
    const h = makeHarness({
        parse: () => parsed("fairlife", 5),
        resolve: () => ({
            kind: "ambiguous",
            options: [
                makeItem(294450, "Fairlife Chocolate"),
                makeItem(294451, "Fairlife Vanilla"),
            ],
        }),
    });
    const res = (await h.controller.handleCommand({
        text: "set fairlife to 5",
    })) as NeedsConfirmationResponse;

    assert.equal(res.status, "needs_confirmation");
    assert.equal(res.quantity, 5);
    assert.deepEqual(res.options, [
        { name: "Fairlife Chocolate", siteInventoryId: 294450 },
        { name: "Fairlife Vanilla", siteInventoryId: 294451 },
    ]);
    assert.equal(h.submitCalls.length, 0);
    assert.equal(h.auditEntries.at(-1)?.status, "needs_confirmation");
});

test("resolver single → submit called with the resolved id and quantity", async () => {
    const success: SuccessResponse = {
        status: "success",
        message: "Fairlife Chocolate set to 5",
        item: { name: "Fairlife Chocolate", siteInventoryId: 294450 },
        quantity: 5,
    };
    const h = makeHarness({
        parse: () => parsed("fairlife", 5),
        resolve: () => ({
            kind: "single",
            item: makeItem(294450, "Fairlife Chocolate"),
        }),
        submit: async () => success,
    });

    const res = await h.controller.handleCommand({ text: "set fairlife to 5" });
    assert.deepEqual(h.submitCalls, [{ siteInventoryId: 294450, quantity: 5 }]);
    assert.deepEqual(res, success);
});
