import { type Result } from "../../reporter";

const results: Result[] = [
	{
		filePath: "missing-source.html",
		errorCount: 2,
		warningCount: 0,
		source: null,
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
];

export default results;
