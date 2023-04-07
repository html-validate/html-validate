import { type Result } from "../../reporter";

const source = `<p>lorem
ipsum</p>
`;

const results: Result[] = [
	{
		filePath: "multiline.html",
		errorCount: 1,
		warningCount: 1,
		source,
		messages: [
			{
				ruleId: "foo",
				ruleUrl: "https://example.net/rule/foo.html",
				severity: 2,
				message: "An error",
				offset: 3,
				line: 1,
				column: 4,
				size: "lorem ipsum".length,
				selector: "p",
			},
		],
	},
];

export default results;
