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
import { MicromartError } from "../errors";
import { logger } from "../utils/logger";

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
    async getPlanogram(siteId: string): Promise<Planogram> {
        const url = `${this.config.baseUrl}${this.config.planogramPath(siteId)}`;
        const headers = {
            ...(await this.auth.getAuthHeaders()),
            Accept: "application/json",
        };

        logger.debug("Fetching planogram", { siteId, url });

        let response: Response;
        try {
            response = await fetch(url, { method: "GET", headers });
        } catch (err) {
            // fetch only rejects on network-level failures (DNS, TCP, TLS).
            throw new MicromartError(
                "NETWORK_ERROR",
                "Could not reach Micromart to fetch the planogram.",
                err,
            );
        }

        // An expired/invalid cookie comes back as 401/403 — a distinct, actionable
        // outcome (refresh the cookie) vs. a generic upstream failure (§17).
        if (response.status === 401 || response.status === 403) {
            const body = await readErrorBody(response);
            logger.warn("Planogram fetch: auth rejected", {
                siteId,
                status: response.status,
                body,
            });
            throw new MicromartError(
                "AUTH_EXPIRED",
                "Micromart session appears to be expired. Refresh the cookie and restart the backend.",
                body,
            );
        }

        if (!response.ok) {
            const body = await readErrorBody(response);
            logger.warn("Planogram fetch failed", {
                siteId,
                status: response.status,
                body,
            });
            throw new MicromartError(
                "PLANOGRAM_FETCH_FAILED",
                `Micromart returned ${response.status} fetching the planogram for site ${siteId}.`,
                body,
            );
        }

        try {
            const planogram = (await response.json()) as Planogram;
            logger.debug("Planogram fetched", { siteId, status: response.status });
            return planogram;
        } catch (err) {
            logger.warn("Planogram fetch: non-JSON response", {
                siteId,
                status: response.status,
            });
            throw new MicromartError(
                "PLANOGRAM_FETCH_FAILED",
                "Micromart returned a non-JSON planogram response.",
                err,
            );
        }
    }

    /** POST /api/restocks/{restockSessionId}/events */
    async postRestockEvent(
        restockSessionId: string,
        event: RestockEvent,
    ): Promise<void> {
        const url = `${this.config.baseUrl}${this.config.restockEventsPath(restockSessionId)}`;
        const headers = {
            ...(await this.auth.getAuthHeaders()),
            Accept: "application/json",
            "Content-Type": "application/json",
        };

        logger.debug("Posting restock event", { restockSessionId, url, event });

        let response: Response;
        try {
            response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(event),
            });
        } catch (err) {
            // fetch only rejects on network-level failures (DNS, TCP, TLS).
            throw new MicromartError(
                "NETWORK_ERROR",
                "Could not reach Micromart to submit the restock event.",
                err,
            );
        }

        // Same auth signal as getPlanogram: 401/403 means the cookie is stale.
        if (response.status === 401 || response.status === 403) {
            const body = await readErrorBody(response);
            logger.warn("Restock event: auth rejected", {
                restockSessionId,
                status: response.status,
                body,
            });
            throw new MicromartError(
                "AUTH_EXPIRED",
                "Micromart session appears to be expired. Refresh the cookie and restart the backend.",
                body,
            );
        }

        if (!response.ok) {
            const body = await readErrorBody(response);
            logger.warn("Restock event failed", {
                restockSessionId,
                status: response.status,
                body,
            });
            throw new MicromartError(
                "MICROMART_POST_FAILED",
                `Micromart returned ${response.status} submitting the restock event.`,
                body,
            );
        }

        logger.debug("Restock event posted", {
            restockSessionId,
            status: response.status,
        });
    }
}

/**
 * Read an error response body for diagnostics, truncated so a large/HTML error
 * page can't flood the logs. Never throws — a body we can't read just becomes
 * undefined rather than masking the original HTTP failure.
 */
const MAX_ERROR_BODY = 500;
async function readErrorBody(response: Response): Promise<string | undefined> {
    try {
        const text = await response.text();
        if (!text) return undefined;
        return text.length > MAX_ERROR_BODY
            ? `${text.slice(0, MAX_ERROR_BODY)}… (truncated)`
            : text;
    } catch {
        return undefined;
    }
}
