export type PatternName = "kebabcase" | "camelcase" | "underscore" | string;

/**
 * @internal
 */
export interface ParsedPattern {
	regexp: RegExp;
	description: string;
}

/**
 * @internal
 */
export function parsePattern(pattern: PatternName): ParsedPattern {
	switch (pattern) {
		case "kebabcase":
			return { regexp: /^[a-z0-9-]+$/, description: pattern };

		case "camelcase":
			return { regexp: /^[a-z][a-zA-Z0-9]+$/, description: pattern };

		case "underscore":
			return { regexp: /^[a-z0-9_]+$/, description: pattern };

		default: {
			/* eslint-disable-next-line security/detect-non-literal-regexp -- expected to be regexp */
			const regexp = new RegExp(pattern);
			return { regexp, description: regexp.toString() };
		}
	}
}
