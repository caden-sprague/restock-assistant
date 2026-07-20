/**
 * errors.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §17 Error Handling
 *
 * A typed error that carries one of the plan's ErrorCodes so lower layers
 * (MicromartClient) can signal a specific failure and the controllers can map
 * it straight to an ErrorResponse `code` without string-matching messages.
 * The plain `message` stays human-readable for logs and the app.
 */

import type { ErrorCode } from "./models/apiResponses";

export class MicromartError extends Error {
    constructor(
        readonly code: ErrorCode,
        message: string,
        readonly cause?: unknown,
    ) {
        super(message);
        this.name = "MicromartError";
    }
}

/**
 * Thrown by SessionService when a command/inventory request arrives before a
 * restock session is active. Carries the plan's SESSION_NOT_READY code so a
 * caller can map it straight to an ErrorResponse (§17). Backend-state error —
 * kept separate from MicromartError (which is about the external API).
 */
export class SessionNotReadyError extends Error {
    readonly code: ErrorCode = "SESSION_NOT_READY";

    constructor(
        message = "Start a restock session before sending commands.",
    ) {
        super(message);
        this.name = "SessionNotReadyError";
    }
}
