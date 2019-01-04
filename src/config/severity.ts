export enum Severity {
	DISABLED = 0,
	WARN = 1,
	ERROR = 2,
}

export function parseSeverity(value: string | number): Severity {
	if (typeof value === "number") {
		return value;
	}
	switch (value) {
		case "off":
			return Severity.DISABLED;
		/* istanbul ignore next: deprecated code which will be removed later */
		case "disable":
			// eslint-disable-next-line no-console
			console.warn(
				`Deprecated alias "disabled" will be removed, replace with severity "off"`
			);
			return Severity.DISABLED;
		case "warn":
			return Severity.WARN;
		case "error":
			return Severity.ERROR;
		default:
			throw new Error(`Invalid severity "${value}"`);
	}
}
