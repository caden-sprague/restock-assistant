/**
 * controllers/sessionController.test.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 POST /session/start
 *
 * Unit tests for SessionController.startSession's branching. SessionService is
 * faked so ORCHESTRATION is tested in isolation — default fallback, response
 * mapping, and MicromartError handling — not planogram fetch or index build.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { SessionController } from "./sessionController";
import type { SessionDefaults } from "./sessionController";
import { MicromartError, SessionNotReadyError } from "../errors";
import type {
    SessionService,
    SessionState,
} from "../services/sessionService";
import type {
    InventoryItem,
    InventoryIndex,
} from "../models/inventoryItem";
import type {
    ErrorResponse,
    SessionReadyResponse,
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

function makeIndex(items: InventoryItem[]): InventoryIndex {
    return {
        byId: new Map(items.map((i) => [i.siteInventoryId, i])),
        byName: new Map(items.map((i) => [i.normalizedName, [i]])),
        allItems: items,
    };
}

const DEFAULTS: SessionDefaults = {
    siteId: "default-site",
    restockSessionId: "default-restock",
};

type HarnessOpts = {
    defaults?: SessionDefaults;
    /** Override the fake service's startSession behavior. */
    start?: (
        siteId: string,
        restockSessionId: string,
    ) => Promise<SessionState>;
};

function makeHarness(opts: HarnessOpts = {}) {
    const startCalls: Array<{ siteId: string; restockSessionId: string }> = [];

    const defaultStart = async (
        siteId: string,
        restockSessionId: string,
    ): Promise<SessionState> => ({
        siteId,
        restockSessionId,
        index: makeIndex([makeItem(294450, "Fairlife Chocolate")]),
        startedAt: "2026-07-20T00:00:00.000Z",
    });

    const sessions = {
        startSession: async (siteId: string, restockSessionId: string) => {
            startCalls.push({ siteId, restockSessionId });
            return (opts.start ?? defaultStart)(siteId, restockSessionId);
        },
    } as unknown as SessionService;

    const controller = new SessionController(
        sessions,
        opts.defaults ?? DEFAULTS,
    );

    return { controller, startCalls };
}

function asReady(
    res: SessionReadyResponse | ErrorResponse,
): SessionReadyResponse {
    assert.equal(res.status, "ready");
    return res as SessionReadyResponse;
}

function asError(res: SessionReadyResponse | ErrorResponse): ErrorResponse {
    assert.equal(res.status, "error");
    return res as ErrorResponse;
}

// --- tests ------------------------------------------------------------------

test("empty body → falls back to both defaults", async () => {
    const h = makeHarness();
    const res = asReady(await h.controller.startSession({}));

    assert.deepEqual(h.startCalls, [
        { siteId: "default-site", restockSessionId: "default-restock" },
    ]);
    assert.equal(res.siteId, "default-site");
    assert.equal(res.restockSessionId, "default-restock");
});

test("provided ids override the defaults", async () => {
    const h = makeHarness();
    const res = asReady(
        await h.controller.startSession({
            siteId: "site-42",
            restockSessionId: "restock-42",
        }),
    );

    assert.deepEqual(h.startCalls, [
        { siteId: "site-42", restockSessionId: "restock-42" },
    ]);
    assert.equal(res.siteId, "site-42");
    assert.equal(res.restockSessionId, "restock-42");
});

test("ids are trimmed before use", async () => {
    const h = makeHarness();
    await h.controller.startSession({
        siteId: "  site-42  ",
        restockSessionId: "\trestock-42\n",
    });

    assert.deepEqual(h.startCalls, [
        { siteId: "site-42", restockSessionId: "restock-42" },
    ]);
});

test("whitespace-only ids fall back to defaults", async () => {
    const h = makeHarness();
    await h.controller.startSession({
        siteId: "   ",
        restockSessionId: "\t\n",
    });

    assert.deepEqual(h.startCalls, [
        { siteId: "default-site", restockSessionId: "default-restock" },
    ]);
});

test("empty-string ids fall back to defaults", async () => {
    const h = makeHarness();
    await h.controller.startSession({ siteId: "", restockSessionId: "" });

    assert.deepEqual(h.startCalls, [
        { siteId: "default-site", restockSessionId: "default-restock" },
    ]);
});

test("only one id provided → the other falls back", async () => {
    const h = makeHarness();
    await h.controller.startSession({ siteId: "site-42" });

    assert.deepEqual(h.startCalls, [
        { siteId: "site-42", restockSessionId: "default-restock" },
    ]);
});

test("ready response echoes state and reports itemCount", async () => {
    const items = [
        makeItem(294450, "Fairlife Chocolate"),
        makeItem(294451, "Fairlife Vanilla"),
        makeItem(294452, "Barebells Cookie & Cream"),
    ];
    const h = makeHarness({
        start: async (siteId, restockSessionId) => ({
            siteId,
            restockSessionId,
            index: makeIndex(items),
            startedAt: "2026-07-20T00:00:00.000Z",
        }),
    });

    const res = asReady(await h.controller.startSession({ siteId: "site-9" }));
    assert.equal(res.status, "ready");
    assert.equal(res.itemCount, 3);
});

test("empty planogram → itemCount 0, still ready", async () => {
    const h = makeHarness({
        start: async (siteId, restockSessionId) => ({
            siteId,
            restockSessionId,
            index: makeIndex([]),
            startedAt: "2026-07-20T00:00:00.000Z",
        }),
    });

    const res = asReady(await h.controller.startSession({}));
    assert.equal(res.itemCount, 0);
});

test("MicromartError → mapped straight to ErrorResponse code/message", async () => {
    const h = makeHarness({
        start: async () => {
            throw new MicromartError(
                "PLANOGRAM_FETCH_FAILED",
                "planogram 503",
            );
        },
    });

    const res = asError(await h.controller.startSession({}));
    assert.equal(res.code, "PLANOGRAM_FETCH_FAILED");
    assert.equal(res.message, "planogram 503");
});

test("AUTH_EXPIRED MicromartError maps its code through", async () => {
    const h = makeHarness({
        start: async () => {
            throw new MicromartError("AUTH_EXPIRED", "cookie expired");
        },
    });

    const res = asError(await h.controller.startSession({}));
    assert.equal(res.code, "AUTH_EXPIRED");
});

test("non-MicromartError propagates to the 500 handler", async () => {
    const h = makeHarness({
        start: async () => {
            throw new Error("boom");
        },
    });

    await assert.rejects(() => h.controller.startSession({}), /boom/);
});

test("SessionNotReadyError is not a MicromartError → propagates", async () => {
    // Guards the instanceof branch: only MicromartError is mapped, other
    // typed errors bubble up rather than being silently turned into a code.
    const h = makeHarness({
        start: async () => {
            throw new SessionNotReadyError();
        },
    });

    await assert.rejects(
        () => h.controller.startSession({}),
        (err: unknown) => err instanceof SessionNotReadyError,
    );
});
