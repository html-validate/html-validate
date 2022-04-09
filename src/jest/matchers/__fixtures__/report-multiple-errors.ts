import { Severity } from "../../../config";
import { Report, Reporter } from "../../../reporter";

export function reportMultipleErrors(): Report {
	const reporter = new Reporter();
	reporter.addManual("inline", {
		ruleId: "my-rule",
		severity: Severity.ERROR,
		message: "mock message",
		line: 2,
		column: 15,
		offset: 43,
		size: 12,
		selector: null,
		context: {
			foo: "bar",
		},
	});
	reporter.addManual("inline", {
		ruleId: "another-rule",
		severity: Severity.ERROR,
		message: "another message",
		line: 2,
		column: 15,
		offset: 43,
		size: 12,
		selector: null,
	});
	return reporter.save();
}

export function reportMultipleErrorsAsync(): Promise<Report> {
	return Promise.resolve(reportMultipleErrors());
}
