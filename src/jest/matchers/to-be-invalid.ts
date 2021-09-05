import { Report } from "../../reporter";
import { diverge } from "../utils";

function toBeInvalid(report: Report): jest.CustomMatcherResult {
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
