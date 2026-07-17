/**
 * auth/hardcodedCookieAuthProvider.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §10 Auth Abstraction (MVP implementation)
 *
 * MVP auth: a manually supplied session cookie from .env. No login, no 2FA.
 */

import type { AuthProvider } from "./authProvider";

export class HardcodedCookieAuthProvider implements AuthProvider {
    constructor(private readonly cookie: string) {}

    async getAuthHeaders(): Promise<Record<string, string>> {
        // Trivial per §10; implemented rather than stubbed.
        return { Cookie: this.cookie };
    }
}
