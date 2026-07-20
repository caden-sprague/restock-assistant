/**
 * services/sessionService.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §7, §15 (/session/start), Milestone 1
 *
 * Owns the single active restock session. State is in-memory for the MVP
 * (SQLite/Postgres later). Fetches the planogram (PlanogramService) and builds
 * the index (InventoryIndexService, Joel) at session start.
 */

import type {InventoryIndex, InventoryItem} from "../models/inventoryItem";
import type { PlanogramService } from "./planogramService";
import type { InventoryIndexService } from "./inventoryIndexService";
import { SessionNotReadyError } from "../errors";
import {logger} from "../utils/logger";

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
        const tempItem: InventoryItem = {
            aliases: ["Barebells"],
            displayName: "Barebells Protein Cookie & Cream",
            normalizedName: "Barebells Protein Cookie & Cream",
            siteInventoryId: 294450
        }
        const tempArr: InventoryItem[] = [tempItem];

        const index: InventoryIndex = {
            byId: new Map([[294450, tempItem]]),
            byName: new Map([["Barebells Protein Cookie & Cream", [tempItem]]]),
            allItems: [tempItem],
        };

        this.active = {
            siteId,
            restockSessionId,
            index,
            startedAt: new Date().toISOString(),
        };
        logger.info("Starting session");
        return this.active;
    }

    /** The active session, or null if none has been started yet. */
    getActive(): SessionState | null {
        return this.active;
    }

    /** The active planogram index; throws SessionNotReadyError if none. */
    getActiveIndex(): InventoryIndex {
        if (!this.active) {
            throw new SessionNotReadyError();
        }
        return this.active.index;
    }
}
