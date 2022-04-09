import { Result } from "../../reporter";

const firstHtml = `<div id="foo"
    class="bar"
    name="baz">
`;

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
				selector: null,
			},
		],
	},
];

export default results;
