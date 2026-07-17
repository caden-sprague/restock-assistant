/**
 * app.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §8, §23 (wiring)
 *
 * Composition root: build the dependency graph (auth → client → services →
 * controllers) and register routes. Framework (Express/Fastify — §5) TBD.
 */

export function createApp(): unknown {
    // TODO(Caden): construct HardcodedCookieAuthProvider, MicromartClient,
    //   services, controllers; register session/command/inventory routes;
    //   return the framework app instance.
    throw new Error("Not implemented: createApp");
}
