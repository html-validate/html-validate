import { Severity } from "../../../config";
import { Report, Reporter } from "../../../reporter";

export function reportError(): Report {
	const reporter = new Reporter();
	reporter.addManual("inline", {
		ruleId: "my-rule",
		severity: Severity.ERROR,
		message: "mock message",
		line: 2,
		column: 15,
		offset: 43,
		size: 12,
		selector: () => null,
		context: {
			foo: "bar",
		},
	});
	return reporter.save();
}

export function reportErrorAsync(): Promise<Report> {
	return Promise.resolve(reportError());
}
