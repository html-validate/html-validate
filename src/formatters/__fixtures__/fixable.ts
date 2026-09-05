import { type Result } from "../../reporter";

const html = `<div id="foo"
    class="bar"
    name="baz">
`;

const results: Result[] = [
	{
		filePath: "fixable.html",
		errorCount: 2,
		warningCount: 2,
		fixableErrorCount: 1,
		fixableWarningCount: 1,
		source: html,
		messages: [
			{
				ruleId: "foo",
				ruleUrl: "https://example.net/rule/foo.html",
				severity: 2,
				message: "An error",
				offset: 5,
				line: 1,
				column: 6,
				size: 2,
				selector: "div",
			},
			{
				ruleId: "foo",
				ruleUrl: "https://example.net/rule/foo.html",
				severity: 2,
				message: "A fixable error",
				offset: 5,
				line: 1,
				column: 6,
				size: 2,
				selector: "div",
				fix() {
					/* do nothing */
				},
			},
			{
				ruleId: "bar",
				ruleUrl: "https://example.net/rule/bar.html",
				severity: 1,
				message: "A warning",
				offset: 18,
				line: 2,
				column: 5,
				size: 5,
				selector: "div",
			},
			{
				ruleId: "bar",
				ruleUrl: "https://example.net/rule/bar.html",
				severity: 1,
				message: "A fixable warning",
				offset: 18,
				line: 2,
				column: 5,
				size: 5,
				selector: "div",
				fix() {
					/* do nothing */
				},
			},
		],
	},
];

export default results;
