/**
 * utils/logger.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §7 Backend Responsibilities (logging)
 *
 * DIAGNOSTIC logger for developers ("fetching planogram", "cookie expired",
 * stack traces). This is NOT the audit log — business records of attempted
 * corrections go through AuditLogService (§18). Don't mix the two.
 *
 * TODO(Caden): swap the console impl for pino/winston.
 */

export type Logger = {
    debug: (msg: string, meta?: unknown) => void;
    info: (msg: string, meta?: unknown) => void;
    warn: (msg: string, meta?: unknown) => void;
    error: (msg: string, meta?: unknown) => void;
};

export const logger: Logger = {
    debug: (msg, meta) => console.debug(msg, meta ?? ""),
    info: (msg, meta) => console.info(msg, meta ?? ""),
    warn: (msg, meta) => console.warn(msg, meta ?? ""),
    error: (msg, meta) => console.error(msg, meta ?? ""),
};
