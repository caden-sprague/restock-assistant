/**
 * server.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §8, §9 (PORT)
 *
 * Process entry point: load env, create the app, listen on PORT.
 */

import { loadEnv } from "./config/env";
import { createApp } from "./app";
import { logger } from "./utils/logger";

export async function startServer(): Promise<void> {
    const env = loadEnv();
    const app = createApp(env);
    try {
        await app.listen({ port: env.port, host: "0.0.0.0" });
        logger.info(`Backend listening on :${env.port}`);
    } catch (err) {
        logger.error("Failed to start server", err);
        process.exit(1);
    }
}

// Run when executed directly (not when imported by tests).
if (require.main === module) {
    void startServer();
}
