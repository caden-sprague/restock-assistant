/**
 * models/parsedCommand.ts
 * Owner: Joel (command + inventory resolver)
 * Plan: §13 Command Parsing
 *
 * NOTE: `action` is always "correct" in the MVP (see review notes) — kept as a
 * field to leave room for future actions, but carries no information today.
 */

export type ParsedCommand = {
    action: "correct";
    productQuery: string;
    quantity: number;
};
