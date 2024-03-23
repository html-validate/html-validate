/**
 * @public
 */
export enum Severity {
	DISABLED = 0,
	WARN = 1,
	ERROR = 2,
}

/**
 * @internal
 */
export function parseSeverity(value: string | number): Severity {
	switch (value) {
		case 0:
		case "off":
			return Severity.DISABLED;
		case 1:
		case "warn":
			return Severity.WARN;
		case 2:
		case "error":
			return Severity.ERROR;
		default:
			throw new Error(`Invalid severity "${String(value)}"`);
	}
}
