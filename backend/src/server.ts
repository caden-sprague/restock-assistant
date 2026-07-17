/**
 * server.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §8, §9 (PORT)
 *
 * Process entry point: load env, create the app, listen on PORT.
 */

export function startServer(): void {
    // TODO(Caden): const env = loadEnv(); const app = createApp(); app.listen(env.port)
    throw new Error("Not implemented: startServer");
}

// Run when executed directly (not when imported by tests).
if (require.main === module) {
    startServer();
}
