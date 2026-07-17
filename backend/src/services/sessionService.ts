/**
 * services/sessionService.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §7, §15 (/session/start), Milestone 1
 *
 * Owns the single active restock session. State is in-memory for the MVP
 * (SQLite/Postgres later). Fetches the planogram (PlanogramService) and builds
 * the index (InventoryIndexService, Joel) at session start.
 */

import type { InventoryIndex } from "../models/inventoryItem";
import type { PlanogramService } from "./planogramService";
import type { InventoryIndexService } from "./inventoryIndexService";

export type SessionState = {
    siteId: string;
    restockSessionId: string;
    index: InventoryIndex;
    startedAt: string;
};

export class SessionService {
    private active: SessionState | null = null;

    constructor(
        private readonly planograms: PlanogramService,
        private readonly indexer: InventoryIndexService,
    ) {}

    /** Fetch planogram → build index → store as the active session. */
    async startSession(
        _siteId: string,
        _restockSessionId: string,
    ): Promise<SessionState> {
        throw new Error("Not implemented: SessionService.startSession");
    }

    /** Throws SESSION_NOT_READY (via caller) if no session is active. */
    getActiveIndex(): InventoryIndex {
        throw new Error("Not implemented: SessionService.getActiveIndex");
    }
}
