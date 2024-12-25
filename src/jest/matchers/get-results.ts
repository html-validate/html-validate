import { type Report, type Result } from "../../reporter";
import { type ValidateStringFn, createSyncFn, workerPath } from "../worker";

/**
 * @internal
 */
export function getResults(filename: string, value: Report | string): Result[] {
	if (typeof value === "string") {
		const syncFn = createSyncFn<ValidateStringFn>(workerPath);
		const report = syncFn(value, filename, {
			rules: {
				"void-style": "off",
			},
		});
		return report.results.map((it) => {
			return { ...it, filePath: "inline" };
		});
	} else {
		return value.results;
	}
}
