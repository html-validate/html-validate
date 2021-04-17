import { Result } from "../../reporter";

const source = `<div id="foo"
    class="bar"
    name="baz">
`;

const results: Result[] = [
	{
		filePath: "missing-url.html",
		errorCount: 2,
		warningCount: 0,
		source,
		messages: [
			{
				ruleId: "foo",
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
];

export default results;
