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
import { MicromartError } from "../errors";
import { logger } from "../utils/logger";

/** Defaults from .env (§9) used when the request body omits a field. */
export type SessionDefaults = {
    siteId: string;
    restockSessionId: string;
};

export class SessionController {
    constructor(
        private readonly sessions: SessionService,
        private readonly defaults: SessionDefaults,
    ) {}

    /** Body may be empty → fall back to DEFAULT_SITE_ID / DEFAULT_RESTOCK_SESSION_ID. */
    async startSession(input: {
        siteId?: string;
        restockSessionId?: string;
    }): Promise<SessionReadyResponse | ErrorResponse> {
        const siteId = input.siteId?.trim() || this.defaults.siteId;
        const restockSessionId =
            input.restockSessionId?.trim() || this.defaults.restockSessionId;

        try {
            const state = await this.sessions.startSession(
                siteId,
                restockSessionId,
            );
            return {
                status: "ready",
                siteId: state.siteId,
                restockSessionId: state.restockSessionId,
                itemCount: state.index.allItems.length,
            };
        } catch (err) {
            // MicromartError carries the plan's ErrorCode (AUTH_EXPIRED /
            // PLANOGRAM_FETCH_FAILED / NETWORK_ERROR); map it straight through.
            if (err instanceof MicromartError) {
                logger.warn("Session start failed", {
                    code: err.code,
                    message: err.message,
                    error: err.cause,
                });
                return {
                    status: "error",
                    code: err.code,
                    message: err.message,
                };
            }
            // Anything unexpected is a real bug — let the app's 500 handler take it.
            throw err;
        }
    }
}
