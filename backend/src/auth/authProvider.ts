/**
 * auth/authProvider.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §10 Auth Abstraction
 *
 * The ONLY auth abstraction. The rest of the backend depends on this interface,
 * never on the cookie directly, so LoginAuthProvider (2FA/login) can replace
 * HardcodedCookieAuthProvider later without touching command/planogram/restock.
 */

export interface AuthProvider {
    getAuthHeaders(): Promise<Record<string, string>>;
}
