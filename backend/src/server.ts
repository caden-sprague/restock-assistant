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

    // Graceful shutdown: on SIGTERM/SIGINT (e.g. `docker stop`, systemd, Ctrl-C)
    // stop accepting connections and let in-flight requests drain via
    // app.close() before exiting, instead of being hard-killed. Guard against a
    // second signal so a impatient double Ctrl-C can't re-enter the handler.
    let shuttingDown = false;
    const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
        if (shuttingDown) return;
        shuttingDown = true;
        logger.info(`Received ${signal}, shutting down`);
        try {
            await app.close();
            process.exit(0);
        } catch (err) {
            logger.error("Error during shutdown", err);
            process.exit(1);
        }
    };

    for (const signal of ["SIGTERM", "SIGINT"] as const) {
        process.on(signal, () => void shutdown(signal));
    }
}

// Run when executed directly (not when imported by tests).
if (require.main === module) {
    void startServer();
}
