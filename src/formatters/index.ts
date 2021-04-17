import checkstyle from "./checkstyle";
import codeframe from "./codeframe"; // eslint-disable-line import/no-named-as-default
import json from "./json";
import stylish from "./stylish";
import text from "./text";
import { Formatter } from "./formatter";

export { Formatter } from "./formatter";

const availableFormatters: Record<string, Formatter> = {
	checkstyle,
	codeframe,
	json,
	stylish,
	text,
};

/**
 * Get formatter function by name.
 *
 * @param name - Name of formatter.
 * @returns Formatter function or null if it doesn't exist.
 */
export function getFormatter(name: string): Formatter | null {
	return availableFormatters[name] ?? null;
}
