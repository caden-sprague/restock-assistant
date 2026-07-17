/**
 * controllers/commandController.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §15 POST /commands, POST /commands/confirm
 *
 * ORCHESTRATES the flow — it does not implement parsing/resolving/restocking.
 * parse (Joel) → resolve (Joel) → submit (Caden). Each is a separate service;
 * the controller sequences them (per the sequence diagram, not the component
 * diagram's chained arrows — see review notes).
 */

import type { CommandParser } from "../services/commandParser";
import type { InventoryResolver } from "../services/inventoryResolver";
import type { RestockService } from "../services/restockService";
import type { SessionService } from "../services/sessionService";
import type { AuditLogService } from "../services/auditLogService";
import type { CommandResponse } from "../models/apiResponses";

export class CommandController {
    constructor(
        private readonly parser: CommandParser,
        private readonly resolver: InventoryResolver,
        private readonly restock: RestockService,
        private readonly sessions: SessionService,
        private readonly audit: AuditLogService,
    ) {}

    /** parse → resolve → (single) submit | (ambiguous) needs_confirmation | (none) error */
    async handleCommand(_input: { text: string }): Promise<CommandResponse> {
        throw new Error("Not implemented: CommandController.handleCommand");
    }

    /** Called after needs_confirmation: submit the user-chosen item. */
    async handleConfirm(_input: {
        siteInventoryId: number;
        quantity: number;
    }): Promise<CommandResponse> {
        throw new Error("Not implemented: CommandController.handleConfirm");
    }
}
