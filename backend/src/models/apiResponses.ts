/**
 * models/apiResponses.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 Backend API Contract, §17 Error Handling
 *
 * The shapes our backend returns to the mobile app. Every response carries a
 * `status`; every error carries a `code` (CLAUDE.md + §17). The plan's inline
 * examples in §13/§15 omit `code` — that inconsistency is tracked in
 * docs/architecture-review-notes.md; this contract treats `code` as required.
 */

export type ErrorCode =
    | "SESSION_NOT_READY"
    | "AUTH_EXPIRED"
    | "INVALID_QUANTITY"
    | "UNPARSEABLE_COMMAND"
    | "PRODUCT_NOT_FOUND"
    | "PLANOGRAM_FETCH_FAILED"
    | "MICROMART_POST_FAILED"
    | "NETWORK_ERROR"
    // A request body that fails JSON-schema validation at the route (missing
    // required field, wrong type, unknown field). Structural — distinct from
    // INVALID_QUANTITY, which is the semantic quantity rule owned by the
    // service. Returned by the app's error handler when Fastify rejects a body.
    | "INVALID_REQUEST"
    // Catch-all for an unexpected/unhandled server fault (a bug, or a
    // collaborator that threw a non-typed error). The app's last-resort error
    // handler (app.ts) returns this; controllers use the specific codes above.
    | "INTERNAL_ERROR";

/** Minimal item reference returned to the app (never the full InventoryItem). */
export type ItemRef = {
    name: string;
    siteInventoryId: number;
};

export type SessionReadyResponse = {
    status: "ready";
    siteId: string;
    restockSessionId: string;
    itemCount: number;
};

export type SuccessResponse = {
    status: "success";
    message: string;
    item: ItemRef;
    quantity: number;
};

export type NeedsConfirmationResponse = {
    status: "needs_confirmation";
    message: string;
    options: ItemRef[];
    quantity: number;
};

export type ErrorResponse = {
    status: "error";
    code: ErrorCode;
    message: string;
};

/** /commands and /commands/confirm outcomes. */
export type CommandResponse =
    SuccessResponse | NeedsConfirmationResponse | ErrorResponse;

export type ApiResponse = CommandResponse | SessionReadyResponse;
