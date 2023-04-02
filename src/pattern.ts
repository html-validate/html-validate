export type PatternName = "kebabcase" | "camelcase" | "underscore" | string;

export function parsePattern(pattern: PatternName): RegExp {
	switch (pattern) {
		case "kebabcase":
			return /^[a-z0-9-]+$/;

		case "camelcase":
			return /^[a-z][a-zA-Z0-9]+$/;

		case "underscore":
			return /^[a-z0-9_]+$/;

		default:
			/* eslint-disable-next-line security/detect-non-literal-regexp -- expected to be regexp */
			return new RegExp(pattern);
	}
}

export function describePattern(pattern: PatternName): string {
	const regexp = parsePattern(pattern).toString();
	switch (pattern) {
		case "kebabcase":
		case "camelcase":
		case "underscore": {
			return `${regexp} (${pattern})`;
		}
		default:
			return regexp;
	}
}
