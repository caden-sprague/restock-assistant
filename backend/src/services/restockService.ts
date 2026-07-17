/**
 * services/restockService.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §16 Restock Event Service
 *
 * Turns validated intent (siteInventoryId + quantity) into the Micromart
 * payload and submits it. Validates quantity and that the item exists in the
 * ACTIVE planogram before sending (review notes: /commands/confirm trusts the
 * client, so this check is the guard).
 */

import type { MicromartClient } from "../clients/micromartClient";
import type { AuditLogService } from "./auditLogService";
import type { SessionService } from "./sessionService";
import type { SuccessResponse, ErrorResponse } from "../models/apiResponses";

export class RestockService {
    constructor(
        private readonly micromart: MicromartClient,
        private readonly session: SessionService,
        private readonly audit: AuditLogService,
    ) {}

    async submit(
        _siteInventoryId: number,
        _quantity: number,
    ): Promise<SuccessResponse | ErrorResponse> {
        throw new Error("Not implemented: RestockService.submit");
    }
}
