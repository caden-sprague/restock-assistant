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
