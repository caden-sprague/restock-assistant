/**
 * utils/fuzzyMatch.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §14 Product Matching Strategy (layer 4: fuzzy)
 *
 * Fuzzy scoring used only as the last matching layer. Keep it dependency-light
 * for the MVP (e.g. Levenshtein / token overlap).
 */

/**
 * Similarity score in [0, 1]; 1 == identical, 0 == no similarity.
 * score = 1 - (levenshteinDistance / maxLength). Inputs are used as-is —
 * callers are responsible for normalizing before calling this.
 */
export function fuzzyScore(a: string, b: string): number {
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) return 1;

    return 1 - levenshteinDistance(a, b) / maxLength;
}

/** Standard two-row DP Levenshtein distance — O(n*m) time, O(min(n,m)) space. */
function levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    let previousRow = Array.from({ length: b.length + 1 }, (_, j) => j);
    let currentRow = new Array<number>(b.length + 1);

    for (let i = 1; i <= a.length; i++) {
        currentRow[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            currentRow[j] = Math.min(
                previousRow[j] + 1, // deletion
                currentRow[j - 1] + 1, // insertion
                previousRow[j - 1] + cost, // substitution
            );
        }
        [previousRow, currentRow] = [currentRow, previousRow];
    }

    return previousRow[b.length];
}
