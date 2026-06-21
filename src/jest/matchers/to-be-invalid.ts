import { type SyncExpectationResult } from "expect";
import { type Report } from "../../reporter";
import { type MaybeAsyncCallback, diverge } from "../utils";

function createMatcher(): MaybeAsyncCallback<Report, []> {
	function toBeInvalid(report: Report): SyncExpectationResult {
		if (report.valid) {
			return {
				pass: false,
				message: () => "Result should be invalid but had no errors",
			};
		}
		return {
			pass: true,
			message: /* istanbul ignore next */ () => "Result should not contain error",
		};
	}
	return diverge(toBeInvalid);
}

export { createMatcher as toBeInvalid };
