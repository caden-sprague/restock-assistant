/**
 * services/commandParser.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §13 Command Parsing, Milestone 3
 *
 * Turns raw text into a ParsedCommand. Start simple (§13 patterns), do not
 * overbuild NLP. Throw ParseError on the failure cases in §13.
 */

import type { ParsedCommand } from "../models/parsedCommand";
import { normalizeText } from "../utils/normalizeText";

/** Thrown when text does not match a supported command pattern. */
export class ParseError extends Error {}

const DEFAULT_MESSAGE =
    "Could not understand command. Try something like 'set fairlife to 5'.";

/** Quantity is always the LAST whitespace-delimited token — this is what lets
 * product names contain numbers (e.g. "fairlife 14oz 5"). */
const KEYWORD_PATTERNS: ReadonlyArray<{ keyword: string; regex: RegExp }> = [
    { keyword: "set", regex: /^set\s+(.+?)(?:\s+to\s+)?(\S+)$/i },
    { keyword: "correct", regex: /^correct\s+(.+?)(?:\s+to\s+)?(\S+)$/i },
    { keyword: "make",    regex: /^make\s+(.+?)(?:\s+to\s+)?(\S+)$/i }
];
const RESERVED_KEYWORDS = new Set(KEYWORD_PATTERNS.map((p) => p.keyword));
const BARE_PATTERN = /^(.+)\s+(\S+)$/;

/** Integers only (optional leading "-"); the controller, not the parser,
 * rejects negative quantities (§17 INVALID_QUANTITY). */
const INTEGER_PATTERN = /^-?\d+$/;

export class CommandParser {
    /**
     * Supported MVP forms (§13):
     *   set <product> to <n> | <product> <n> | correct <product> <n> | make <product> <n>
     *
     * NOTE (review notes): the bare "<product> <n>" form collides with names that
     * contain numbers (e.g. "fairlife 14oz"). Anchor quantity as the trailing
     * integer, or require a keyword.
     */
    parse(text: string): ParsedCommand {
        const trimmed = (text ?? "").trim().replace(/\s+/g, " ");
        if (!trimmed) {
            throw new ParseError(DEFAULT_MESSAGE);
        }

        const firstWord = trimmed.split(" ")[0].toLowerCase();

        // If the command opens with a reserved keyword, it must match that
        // keyword's exact pattern — never fall through to the bare form,
        // which would otherwise silently swallow the keyword into the
        // product name (e.g. "set fairlife" from a malformed "set fairlife 5").
        if (RESERVED_KEYWORDS.has(firstWord)) {
            const pattern = KEYWORD_PATTERNS.find((p) => p.keyword === firstWord)!;
            const match = pattern.regex.exec(trimmed);
            if (!match) {
                throw new ParseError(DEFAULT_MESSAGE);
            }
            return this.finish(match[1], match[2]);
        }

        const match = BARE_PATTERN.exec(trimmed);
        if (!match) {
            throw new ParseError(DEFAULT_MESSAGE);
        }
        return this.finish(match[1], match[2]);
    }

    private finish(rawProduct: string, rawQuantity: string): ParsedCommand {
        if (!INTEGER_PATTERN.test(rawQuantity)) {
            throw new ParseError(DEFAULT_MESSAGE);
        }

        const productQuery = normalizeText(rawProduct);
        if (!productQuery || productQuery == "to") {
            throw new ParseError(DEFAULT_MESSAGE);
        }

        return {
            action: "correct",
            productQuery,
            quantity: parseInt(rawQuantity, 10),
        };
    }
}
