import { Severity } from "../../../config";
import { Source } from "../../../context";
import { Report, Reporter } from "../../../reporter";

export function reportError(): Report {
	const reporter = new Reporter();
	const data = /* HTML */ `
		<header id="foo">
			<div>
				<p>lorem ipsum</p>
			</div>
		</header>
	`;
	const source: Source = {
		filename: "inline",
		line: 1,
		column: 1,
		offset: 0,
		data,
	};
	const offset = data.indexOf("lorem ipsum");
	reporter.addManual("inline", {
		ruleId: "my-rule",
		severity: Severity.ERROR,
		message: "mock message",
		line: 4,
		column: 8,
		offset,
		size: "lorem ipsum".length,
		selector: () => "#foo > div",
		context: {
			foo: "bar",
		},
	});
	return reporter.save([source]);
}

export function reportErrorAsync(): Promise<Report> {
	return Promise.resolve(reportError());
}
