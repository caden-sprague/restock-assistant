/**
 * services/auditLogService.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §18 Audit Logging
 *
 * Business record of EVERY attempted correction — evidence, not developer
 * output. Distinct from utils/logger.ts. Must not drop entries. MVP writes
 * JSON lines (console/file); later → SQLite/Postgres, so keep entries
 * structured, not formatted strings.
 */

export type AuditLogEntry = {
    timestamp: string;
    commandText?: string;
    parsedProductQuery?: string;
    matchedItemName?: string;
    siteInventoryId?: number;
    quantity?: number;
    status: "success" | "error" | "needs_confirmation";
    errorMessage?: string;
};

export class AuditLogService {
    /**
     * Append one entry. MVP impl writes a JSON line.
     * TODO(Caden): make the sink configurable (file, then DB in Milestone 6).
     */
    log(entry: AuditLogEntry): void {
        console.log(JSON.stringify({ audit: entry }));
    }
}
