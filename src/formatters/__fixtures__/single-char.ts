import { type Result } from "../../reporter";

const firstHtml = `x`;

const results: Result[] = [
	{
		filePath: "single-char.html",
		errorCount: 1,
		warningCount: 1,
		source: firstHtml,
		messages: [
			{
				ruleId: "foo",
				ruleUrl: "https://example.net/rule/foo.html",
				severity: 2,
				message: "An error",
				offset: 0,
				line: 1,
				column: 1,
				size: 1,
				selector: null,
			},
		],
	},
];

export default results;
