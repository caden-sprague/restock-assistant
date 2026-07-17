/**
 * controllers/sessionController.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 POST /session/start
 *
 * Framework-agnostic handler: takes a parsed request, returns a response object.
 * The route file adapts Express/Fastify to this signature.
 */

import type { SessionService } from "../services/sessionService";
import type {
    SessionReadyResponse,
    ErrorResponse,
} from "../models/apiResponses";

export class SessionController {
    constructor(private readonly sessions: SessionService) {}

    /** Body may be empty → fall back to DEFAULT_SITE_ID / DEFAULT_RESTOCK_SESSION_ID. */
    async startSession(_input: {
        siteId?: string;
        restockSessionId?: string;
    }): Promise<SessionReadyResponse | ErrorResponse> {
        throw new Error("Not implemented: SessionController.startSession");
    }
}
