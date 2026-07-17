/**
 * config/micromartConfig.ts
 * Owner: Caden (backend / Micromart integration)
 * Plan: §11 Micromart Client (endpoints)
 *
 * The one place that knows Micromart's URL shapes. MicromartClient uses these;
 * nothing else should hardcode a path.
 */

export type MicromartConfig = {
    baseUrl: string;
    planogramPath: (siteId: string) => string;
    restockEventsPath: (restockSessionId: string) => string;
};

export function createMicromartConfig(baseUrl: string): MicromartConfig {
    return {
        baseUrl,
        // GET  {baseUrl}/api/sites/{site_id}/planogram
        planogramPath: (siteId) => `/api/sites/${siteId}/planogram`,
        // POST {baseUrl}/api/restocks/{restock_session_id}/events
        restockEventsPath: (restockSessionId) =>
            `/api/restocks/${restockSessionId}/events`,
    };
}
