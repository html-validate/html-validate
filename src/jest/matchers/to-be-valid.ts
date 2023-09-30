import { type Report } from "../../reporter";
import { type MatcherResult, type MaybeAsyncCallback, diverge } from "../utils";

function createMatcher(): MaybeAsyncCallback<Report, []> {
	function toBeValid(report: Report): MatcherResult {
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
