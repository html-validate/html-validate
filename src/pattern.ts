export type PatternName =
	| "kebabcase"
	| "camelcase"
	| "underscore"
	| "snakecase"
	| "bem"
	| `/${string}/`;

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
			return { regexp: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, description: pattern };

		case "camelcase":
			return { regexp: /^[a-z][a-zA-Z0-9]*$/, description: pattern };

		case "snakecase":
		case "underscore":
			return { regexp: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/, description: pattern };

		case "bem": {
			const block = "[a-z][a-z0-9]*(?:-[a-z0-9]+)*";
			const element = "(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?";
			const modifier = "(?:--[a-z0-9]+(?:-[a-z0-9]+)*){0,2}";
			return {
				regexp: new RegExp(`^${block}${element}${modifier}$`),
				description: pattern,
			};
		}

		default: {
			if (pattern.startsWith("/") && pattern.endsWith("/")) {
				const regexpSource = pattern.slice(1, -1);
				/* eslint-disable-next-line security/detect-non-literal-regexp -- expected to be regexp */
				const regexp = new RegExp(regexpSource);
				return { regexp, description: regexp.toString() };
			}

			/* @deprecated: Support for patterns without /.../ wrapper is deprecated */
			/* eslint-disable-next-line no-console -- deprecation warning */
			console.warn(
				`Custom pattern "${pattern}" should be wrapped in forward slashes, e.g., "/${pattern}/". Support for unwrapped patterns is deprecated and will be removed in a future version.`,
			);
			/* eslint-disable-next-line security/detect-non-literal-regexp -- expected to be regexp */
			const regexp = new RegExp(pattern);
			return { regexp, description: regexp.toString() };
		}
	}
}
