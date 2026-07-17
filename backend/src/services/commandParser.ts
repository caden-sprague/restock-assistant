/**
 * services/commandParser.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §13 Command Parsing, Milestone 3
 *
 * Turns raw text into a ParsedCommand. Start simple (§13 patterns), do not
 * overbuild NLP. Throw ParseError on the failure cases in §13.
 */

import type { ParsedCommand } from "../models/parsedCommand";

/** Thrown when text does not match a supported command pattern. */
export class ParseError extends Error {}

export class CommandParser {
    /**
     * Supported MVP forms (§13):
     *   set <product> to <n> | <product> <n> | correct <product> <n> | make <product> <n>
     *
     * NOTE (review notes): the bare "<product> <n>" form collides with names that
     * contain numbers (e.g. "fairlife 14oz"). Anchor quantity as the trailing
     * integer, or require a keyword.
     */
    parse(_text: string): ParsedCommand {
        throw new Error("Not implemented: CommandParser.parse");
    }
}
