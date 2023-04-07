import { type Result } from "../../reporter";

const firstHtml = `<div id="foo"
    class="bar"
    name="baz">
`;

const secondHtml = `<p>lorem ipsum</p>\n`;

const results: Result[] = [
	{
		filePath: "first.html",
		errorCount: 1,
		warningCount: 1,
		source: firstHtml,
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
		],
	},
	{
		filePath: "second.html",
		errorCount: 1,
		warningCount: 0,
		source: secondHtml,
		messages: [
			{
				ruleId: "no-lorem-ipsum",
				ruleUrl: "https://example.net/rule/no-lorem-ipsum.html",
				severity: 2,
				message: "Lorem ipsum is not allowed",
				offset: 3,
				line: 1,
				column: 4,
				size: 11,
				selector: "p",
			},
		],
	},
];

export default results;
