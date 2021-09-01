import { Report } from "../../reporter";

export async function toBeInvalid(
	this: jest.MatcherUtils,
	actual: Report | Promise<Report>
): Promise<jest.CustomMatcherResult> {
	const report = await actual;
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
