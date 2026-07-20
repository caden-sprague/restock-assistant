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
        private readonly planogramFetcher: PlanogramService,
        private readonly indexer: InventoryIndexService,
    ) {}

    /** Fetch planogram → build index → store as the active session. */
    async startSession(
        siteId: string,
        restockSessionId: string,
    ): Promise<SessionState> {
        const planogram = await this.planogramFetcher.fetchPlanogram(siteId);
        // TODO implement indexer's build and remove stubbed InventoryIndex
        // const index = this.indexer.build(planogram);
        const index: InventoryIndex = {
            byId: new Map(),
            byName: new Map(),
            allItems: [],
        };

        this.active = {
            siteId,
            restockSessionId,
            index,
            startedAt: new Date().toISOString(),
        };
        return this.active;
    }

    /** Throws SESSION_NOT_READY (via caller) if no session is active. */
    getActiveIndex(): InventoryIndex {
        throw new Error("Not implemented: SessionService.getActiveIndex");
    }
}
