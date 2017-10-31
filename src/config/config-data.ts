type RuleSeverity = "disable" | "warn" | "error" | number;

export interface ConfigData {
	extends?: string[];

	/**
	 * List of sources for element metadata.
	 *
	 * The following sources are allowed:
	 *
	 * - "html5" (default) for the builtin metadata.
	 * - node module which export metadata
	 * - local path to json or js file exporting metadata.
	 *
	 * If elements isn't specified it defaults to `["html5"]`
	 */
	elements?: string[];

	rules?: { [key: string]: RuleSeverity | [RuleSeverity, any] };
}
