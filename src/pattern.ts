export function parsePattern(pattern: string): RegExp {
	switch (pattern){
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
