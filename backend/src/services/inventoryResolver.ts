/**
 * services/inventoryResolver.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §14 Product Matching Strategy, Milestone 4
 *
 * Maps a productQuery to an InventoryItem using LAYERED matching:
 *   1. exact normalized name  2. alias  3. contains  4. fuzzy
 * Returns ambiguity when multiple good matches exist, not_found otherwise.
 */

import type { InventoryIndex, InventoryItem } from "../models/inventoryItem";
import { normalizeText } from "../utils/normalizeText";
import { fuzzyScore } from "../utils/fuzzyMatch";

export type ResolveResult =
    | { kind: "single"; item: InventoryItem }
    | { kind: "ambiguous"; options: InventoryItem[] }
    | { kind: "not_found" };

/** Minimum fuzzyScore (§14 layer 4) to count as a candidate at all. */
const FUZZY_THRESHOLD = 0.6;

export class InventoryResolver {
    resolve(query: string, index: InventoryIndex): ResolveResult {
        const normalizedQuery = normalizeText(query);
        if (!normalizedQuery) {
            return { kind: "not_found" };
        }

        // Layer 1: exact normalized name match.
        const exact = index.byName.get(normalizedQuery);
        if (exact && exact.length > 0) {
            return fromCandidates(exact);
        }

        // Layer 2: alias match.
        const aliasMatches = index.allItems.filter((item) =>
            item.aliases.some((alias) => normalizeText(alias) === normalizedQuery),
        );
        if (aliasMatches.length > 0) {
            return fromCandidates(aliasMatches);
        }

        // Layer 3: contains match, either direction (short query into a long
        // name, or a long query that happens to contain a short item name).
        const containsMatches = index.allItems.filter(
            (item) =>
                item.normalizedName.includes(normalizedQuery) ||
                normalizedQuery.includes(item.normalizedName),
        );
        if (containsMatches.length > 0) {
            return fromCandidates(containsMatches);
        }

        // Layer 4: fuzzy match. Every item scoring at/above the threshold is
        // a candidate — not just the single best score — so two similarly
        // close near-misses still surface as ambiguous rather than a guess.
        const fuzzyMatches = index.allItems
            .map((item) => ({
                item,
                score: fuzzyScore(normalizedQuery, item.normalizedName),
            }))
            .filter(({ score }) => score >= FUZZY_THRESHOLD)
            .sort((a, b) => b.score - a.score)
            .map(({ item }) => item);
        if (fuzzyMatches.length > 0) {
            return fromCandidates(fuzzyMatches);
        }

        return { kind: "not_found" };
    }
}

/** Zero candidates must never reach here — callers gate on length > 0. */
function fromCandidates(candidates: InventoryItem[]): ResolveResult {
    if (candidates.length === 1) {
        return { kind: "single", item: candidates[0] };
    }
    return { kind: "ambiguous", options: candidates };
}
