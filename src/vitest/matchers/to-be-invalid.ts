import { type AsyncExpectationResult, type MatcherState } from "@vitest/expect";
import { type Report } from "../../reporter";
import { getReport } from "../utils";

type ToBeInvalidMatcher = (
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
) => AsyncExpectationResult;

async function toBeInvalid(
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
): AsyncExpectationResult {
	const report = await getReport(received, this);

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

function createMatcher(): ToBeInvalidMatcher {
	return toBeInvalid;
}

export { createMatcher as toBeInvalid };
