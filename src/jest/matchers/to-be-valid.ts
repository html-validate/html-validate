import { Report } from "../../reporter";

export async function toBeValid(
	this: jest.MatcherUtils,
	actual: Report | Promise<Report>
): Promise<jest.CustomMatcherResult> {
	const report = await actual;
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
