/**
 * utils/fuzzyMatch.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §14 Product Matching Strategy (layer 4: fuzzy)
 *
 * Fuzzy scoring used only as the last matching layer. Keep it dependency-light
 * for the MVP (e.g. Levenshtein / token overlap).
 */

/** Similarity score in [0, 1]; 1 == identical. */
export function fuzzyScore(_a: string, _b: string): number {
    throw new Error("Not implemented: fuzzyMatch.fuzzyScore");
}
