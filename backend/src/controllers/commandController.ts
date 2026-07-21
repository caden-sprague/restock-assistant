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
import { ParseError } from "../services/commandParser";
import {InventoryResolver, ResolveResult} from "../services/inventoryResolver";
import type { RestockService } from "../services/restockService";
import type { SessionService } from "../services/sessionService";
import type { AuditLogService } from "../services/auditLogService";
import type { ParsedCommand } from "../models/parsedCommand";
import type {
    CommandResponse,
    ErrorCode,
    ErrorResponse,
} from "../models/apiResponses";
import type {InventoryItem} from "../models/inventoryItem";

export class CommandController {
    constructor(
        private readonly parser: CommandParser,
        private readonly resolver: InventoryResolver,
        private readonly restock: RestockService,
        private readonly sessions: SessionService,
        private readonly audit: AuditLogService,
    ) {}

    /** parse → resolve → (single) submit | (ambiguous) needs_confirmation | (none) error */
    async handleCommand(input: { text: string }): Promise<CommandResponse> {
        const text = input?.text ?? "";

        // A command is meaningless without an active planogram to resolve
        // against — fail fast before parsing (§17 SESSION_NOT_READY).
        const active = this.sessions.getActive();
        if (!active) {
            return this.fail(
                "SESSION_NOT_READY",
                "Start a restock session before sending commands.",
                { commandText: text },
            );
        }

        let parsed: ParsedCommand;
        try {
            parsed = this.parser.parse(text);
        } catch (err) {
            if (err instanceof ParseError) {
                return this.fail(
                    "UNPARSEABLE_COMMAND",
                    err.message ||
                        "Could not understand command. Try something like 'set fairlife to 5'.",
                    { commandText: text },
                );
            }
            throw err;
        }

        // Guard quantity before resolving so an ambiguous match never returns a
        // needs_confirmation carrying a bad quantity. RestockService re-checks
        // for the /commands/confirm path.
        if (!Number.isInteger(parsed.quantity) || parsed.quantity < 0) {
            return this.fail(
                "INVALID_QUANTITY",
                "Quantity must be a non-negative number.",
                {
                    commandText: text,
                    parsedProductQuery: parsed.productQuery,
                    quantity: parsed.quantity,
                },
            );
        }

        let result : ResolveResult = this.resolver.resolve(parsed.productQuery, active.index);

        switch (result.kind) {
            case "not_found":
                return this.fail(
                    "PRODUCT_NOT_FOUND",
                    `No matching inventory item found for '${parsed.productQuery}'.`,
                    {
                        commandText: text,
                        parsedProductQuery: parsed.productQuery,
                        quantity: parsed.quantity,
                    },
                );

            case "ambiguous": {
                this.audit.log({
                    timestamp: new Date().toISOString(),
                    commandText: text,
                    parsedProductQuery: parsed.productQuery,
                    quantity: parsed.quantity,
                    status: "needs_confirmation",
                });
                return {
                    status: "needs_confirmation",
                    message: "Which item did you mean?",
                    options: result.options.map((item) => ({
                        name: item.displayName,
                        siteInventoryId: item.siteInventoryId,
                    })),
                    quantity: parsed.quantity,
                };
            }

            case "single":
                // RestockService owns the submission audit entry.
                return this.restock.submit(
                    result.item.siteInventoryId,
                    parsed.quantity,
                );
        }
    }

    /** Called after needs_confirmation: submit the user-chosen item. */
    async handleConfirm(input: {
        siteInventoryId: number;
        quantity: number;
    }): Promise<CommandResponse> {
        return this.restock.submit(input.siteInventoryId, input.quantity);
    }

    /** Build an ErrorResponse and audit the pre-submission failure (§18). */
    private fail(
        code: ErrorCode,
        message: string,
        ctx: {
            commandText?: string;
            parsedProductQuery?: string;
            quantity?: number;
        },
    ): ErrorResponse {
        this.audit.log({
            timestamp: new Date().toISOString(),
            commandText: ctx.commandText,
            parsedProductQuery: ctx.parsedProductQuery,
            quantity: ctx.quantity,
            status: "error",
            errorMessage: message,
        });
        return { status: "error", code, message };
    }
}
