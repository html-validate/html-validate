import { type Result } from "../../reporter";

const markup = `123\n56\n8`;
const ruleId = "foo";
const ruleUrl = "https://example.net/rule/foo.html";

const results: Result[] = [
	{
		filePath: "line-bounds.html",
		errorCount: 1,
		warningCount: 1,
		source: markup,
		messages: [
			{
				ruleId,
				ruleUrl,
				severity: 2,
				message: "This errors is on line 0 (before first line)",
				offset: 0,
				line: 0,
				column: 1,
				size: 1,
				selector: null,
			},
			{
				ruleId,
				ruleUrl,
				severity: 1,
				message: "This errors is on line 4 (after last line)",
				offset: markup.length,
				line: 4,
				column: 1,
				size: 1,
				selector: null,
			},
		],
	},

	{
		filePath: "file-bounds.html",
		errorCount: 1,
		warningCount: 0,
		source: markup,
		messages: [
			{
				ruleId,
				ruleUrl,
				severity: 2,
				message: "This errors is after EOF",
				offset: markup.length,
				line: 3,
				column: 2,
				size: 1,
				selector: null,
			},
		],
	},
];

export default results;
