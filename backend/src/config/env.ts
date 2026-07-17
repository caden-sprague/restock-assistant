/**
 * config/env.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §9 Environment Configuration
 *
 * Loads and validates .env. See .env.example at the repo root for the keys.
 */

export type Env = {
    port: number;
    micromartBaseUrl: string;
    micromartCookie: string;
    defaultSiteId: string;
    defaultRestockSessionId: string;
};

function requireEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined || value.trim() === "") {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

/**
 * Read + validate environment variables. Throws early (fail-fast on boot) if a
 * required value is missing. Values are loaded into process.env by Node's
 * --env-file flag (see the `start`/`dev` scripts) — no dotenv dependency.
 */
export function loadEnv(): Env {
    const port = Number(process.env.PORT ?? "3000");
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error(`Invalid PORT: ${process.env.PORT ?? "(unset)"}`);
    }
    return {
        port,
        micromartBaseUrl: requireEnv("MICROMART_BASE_URL"),
        micromartCookie: requireEnv("MICROMART_COOKIE"),
        defaultSiteId: requireEnv("DEFAULT_SITE_ID"),
        defaultRestockSessionId: requireEnv("DEFAULT_RESTOCK_SESSION_ID"),
    };
}
