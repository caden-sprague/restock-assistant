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

/**
 * Read + validate environment variables. Throw early (fail-fast on boot) if a
 * required value is missing.
 *
 * TODO(Caden): load dotenv, validate presence, coerce PORT to number.
 */
export function loadEnv(): Env {
    throw new Error("Not implemented: config/env.loadEnv");
}
