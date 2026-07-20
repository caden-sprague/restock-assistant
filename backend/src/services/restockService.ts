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
import type { RestockEvent } from "../models/restockEvent";
import type {
    SuccessResponse,
    ErrorResponse,
    ErrorCode,
} from "../models/apiResponses";
import { MicromartError } from "../errors";

export class RestockService {
    constructor(
        private readonly micromart: MicromartClient,
        private readonly session: SessionService,
        private readonly audit: AuditLogService,
    ) {}

    /**
     * The single submission path for both /commands (resolved to one item) and
     * /commands/confirm (client-chosen id). Validates against the ACTIVE
     * planogram — /commands/confirm trusts the client, so these guards matter —
     * then posts the correction and audit-logs the outcome (§16, §18).
     */
    async submit(
        siteInventoryId: number,
        quantity: number,
    ): Promise<SuccessResponse | ErrorResponse> {
        const active = this.session.getActive();
        if (!active) {
            return this.fail(
                "SESSION_NOT_READY",
                "Start a restock session before sending commands.",
                { siteInventoryId, quantity },
            );
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
            return this.fail(
                "INVALID_QUANTITY",
                "Quantity must be a non-negative number.",
                { siteInventoryId, quantity },
            );
        }

        const item = active.index.byId.get(siteInventoryId);
        if (!item) {
            return this.fail(
                "PRODUCT_NOT_FOUND",
                `No inventory item ${siteInventoryId} in the active planogram.`,
                { siteInventoryId, quantity },
            );
        }

        const event: RestockEvent = {
            type: "correct",
            quantity,
            site_inventory_id: siteInventoryId,
        };

        try {
            await this.micromart.postRestockEvent(
                active.restockSessionId,
                event,
            );
        } catch (err) {
            // MicromartError carries the plan's ErrorCode (AUTH_EXPIRED /
            // MICROMART_POST_FAILED / NETWORK_ERROR); map it straight through.
            if (err instanceof MicromartError) {
                this.audit.log({
                    timestamp: new Date().toISOString(),
                    matchedItemName: item.displayName,
                    siteInventoryId,
                    quantity,
                    status: "error",
                    errorMessage: err.message,
                });
                return { status: "error", code: err.code, message: err.message };
            }
            throw err;
        }

        const message = `${item.displayName} set to ${quantity}`;
        this.audit.log({
            timestamp: new Date().toISOString(),
            matchedItemName: item.displayName,
            siteInventoryId,
            quantity,
            status: "success",
        });
        return {
            status: "success",
            message,
            item: { name: item.displayName, siteInventoryId },
            quantity,
        };
    }

    private fail(
        code: ErrorCode,
        message: string,
        ctx: { siteInventoryId: number; quantity: number },
    ): ErrorResponse {
        this.audit.log({
            timestamp: new Date().toISOString(),
            siteInventoryId: ctx.siteInventoryId,
            quantity: ctx.quantity,
            status: "error",
            errorMessage: message,
        });
        return { status: "error", code, message };
    }
}
