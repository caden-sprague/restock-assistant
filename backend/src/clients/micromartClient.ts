/**
 * clients/micromartClient.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §11 Micromart Client
 *
 * The ONLY module that knows real Micromart endpoints/payloads. Gets auth
 * headers from an AuthProvider (never reads the cookie directly).
 */

import type { AuthProvider } from "../auth/authProvider";
import type { MicromartConfig } from "../config/micromartConfig";
import type { RestockEvent } from "../models/restockEvent";

/**
 * Raw planogram JSON as returned by Micromart. Shape is UNVERIFIED — capture a
 * real response and pin this before Milestone 2 (see review notes §Gaps).
 */
export type Planogram = Record<string, unknown>;

export class MicromartClient {
    constructor(
        private readonly auth: AuthProvider,
        private readonly config: MicromartConfig,
    ) {}

    /** GET /api/sites/{siteId}/planogram */
    async getPlanogram(_siteId: string): Promise<Planogram> {
        throw new Error("Not implemented: MicromartClient.getPlanogram");
    }

    /** POST /api/restocks/{restockSessionId}/events */
    async postRestockEvent(
        _restockSessionId: string,
        _event: RestockEvent,
    ): Promise<void> {
        throw new Error("Not implemented: MicromartClient.postRestockEvent");
    }
}
