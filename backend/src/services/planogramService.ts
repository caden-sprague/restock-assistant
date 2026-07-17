/**
 * services/planogramService.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §12, Milestone 1/2
 *
 * Thin seam over MicromartClient.getPlanogram. Exists as a testing/ownership
 * boundary (mockable in tests) — deliberately does no transformation; that is
 * InventoryIndexService's job (Joel).
 */

import type { MicromartClient, Planogram } from "../clients/micromartClient";

export class PlanogramService {
    constructor(private readonly micromart: MicromartClient) {}

    async fetchPlanogram(siteId: string): Promise<Planogram> {
        return this.micromart.getPlanogram(siteId);
    }
}
