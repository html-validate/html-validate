import { type SyncExpectationResult } from "@vitest/expect";
import { type Report } from "../../reporter";
import { type MaybeAsyncCallback, diverge } from "../utils";

function createMatcher(): MaybeAsyncCallback<Report, []> {
	function toBeValid(report: Report): SyncExpectationResult {
		if (report.valid) {
			return {
				pass: true,
				message: /* istanbul ignore next */ () => "Result should not contain error",
			};
		} else {
			const firstError = report.results[0].messages[0];
			return {
				pass: false,
				message: () => `Result should be valid but had error "${firstError.message}"`,
			};
		}
	}
	return diverge(toBeValid);
}

export { createMatcher as toBeValid };
