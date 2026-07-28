import { type AsyncExpectationResult, type MatcherState } from "@vitest/expect";
import { type Report } from "../../reporter";
import { getReport } from "../utils";

type ToBeValidMatcher = (
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
) => AsyncExpectationResult;

async function toBeValid(
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
): AsyncExpectationResult {
	const report = await getReport(received, this);

	if (!report.valid) {
		const firstError = report.results[0].messages[0];
		return {
			pass: false,
			message: () => `Result should be valid but had error "${firstError.message}"`,
		};
	}

	return {
		pass: true,
		message: /* istanbul ignore next */ () => "Result should not contain error",
	};
}

function createMatcher(): ToBeValidMatcher {
	return toBeValid;
}

export { createMatcher as toBeValid };
