/**
 * utils/normalizeText.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §14 Product Matching Strategy (Normalization)
 *
 * Normalize both planogram names and user input the SAME way so matching is
 * apples-to-apples.
 */

/**
 * Lowercase, strip punctuation (keeping only alphanumerics and whitespace),
 * collapse internal whitespace, and trim. Punctuation is removed rather than
 * replaced with a space, so "sugar-free" normalizes to "sugarfree".
 */
export function normalizeText(input: string): string {
    if (input == null) return "";
    return input
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
