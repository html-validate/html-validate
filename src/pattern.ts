export function parsePattern(pattern: string): RegExp {
	switch (pattern) {
		case "kebabcase":
			return /^[a-z0-9-]+$/;

		case "camelcase":
			return /^[a-z][a-zA-Z0-9]+$/;

		case "underscore":
			return /^[a-z0-9_]+$/;

		default:
			return new RegExp(pattern);
	}
}

export function describePattern(pattern: string): string {
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
