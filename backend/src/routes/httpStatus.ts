/**
 * routes/httpStatus.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 Backend API Contract, §17 Error Handling
 *
 * The contract is expressed via the JSON `status`/`code` fields (§15, §17); the
 * plan does not pin HTTP status codes. This is the single place that maps a
 * response body to an HTTP status so all three route files stay consistent.
 *
 *   ready | success | needs_confirmation -> 200
 *   error -> mapped by `code` (below), unknown/absent code -> 500
 */

import type { ErrorCode } from "../models/apiResponses";

const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
    UNPARSEABLE_COMMAND: 400,
    INVALID_QUANTITY: 400,
    PRODUCT_NOT_FOUND: 404,
    SESSION_NOT_READY: 409,
    AUTH_EXPIRED: 502,
    PLANOGRAM_FETCH_FAILED: 502,
    MICROMART_POST_FAILED: 502,
    NETWORK_ERROR: 502,
};

export function httpStatusFor(body: unknown): number {
    const b = (body ?? {}) as { status?: string; code?: ErrorCode };
    // Bodies without a `status` field (e.g. the /inventory/search result) are
    // always successes.
    if (b.status !== "error") return 200;
    return (b.code && ERROR_HTTP_STATUS[b.code]) || 500;
}
