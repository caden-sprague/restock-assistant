/**
 * utils/normalizeText.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §14 Product Matching Strategy (Normalization)
 *
 * Normalize both planogram names and user input the SAME way so matching is
 * apples-to-apples.
 */

/**
 * Lowercase, trim, collapse internal whitespace. Basic form implemented; the
 * punctuation-stripping decision (§14 "optionally remove punctuation") is left
 * as a TODO for Joel so it stays intentional.
 */
export function normalizeText(input: string): string {
    return input.trim().toLowerCase().replace(/\s+/g, " ");
    // TODO(Joel): decide on punctuation stripping (e.g. "14oz" vs "14 oz").
}
