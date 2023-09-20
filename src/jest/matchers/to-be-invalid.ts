import { type Report } from "../../reporter";
import { type MatcherResult, diverge } from "../utils";

function toBeInvalid(report: Report): MatcherResult {
	if (report.valid) {
		return {
			pass: false,
			message: () => "Result should be invalid but had no errors",
		};
	} else {
		return {
			pass: true,
			message: /* istanbul ignore next */ () => "Result should not contain error",
		};
	}
}

export default diverge(toBeInvalid);
