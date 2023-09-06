function escape(value: string): string {
	return JSON.stringify(value);
}

function format(value: unknown, quote: boolean = false): string {
	if (value === null) {
		return "null";
	}

	if (typeof value === "number") {
		return value.toString();
	}

	if (typeof value === "string") {
		return quote ? escape(value) : value;
	}

	if (Array.isArray(value)) {
		const content = value.map((it) => format(it, true)).join(", ");
		return `[ ${content} ]`;
	}

	if (typeof value === "object") {
		const content = Object.entries(value)
			.map(([key, nested]) => `${key}: ${format(nested, true)}`)
			.join(", ");
		return `{ ${content} }`;
	}

	return String(value);
}

/**
 * Replaces placeholder `{{ ... }}` with values from given object.
 *
 * @internal
 */
export function interpolate(text: string, data: Record<string, unknown>): string {
	return text.replace(/{{\s*([^\s{}]+)\s*}}/g, (match, key): string => {
		return typeof data[key] !== "undefined" ? format(data[key]) : match;
	});
}
