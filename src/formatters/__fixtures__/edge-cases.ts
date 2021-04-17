import { Result } from "../../reporter";

const source = `<p>lorem ipsum</p>\n`;

const results: Result[] = [
	{
		filePath: "edge-cases.html",
		errorCount: 1,
		warningCount: 1,
		source,
		messages: [
			{
				ruleId: "invalid-severity",
				severity: 3,
				message: "Has invalid severity",
				offset: 0,
				line: 1,
				column: 1,
				size: 1,
				selector: null,
			},
			{
				ruleId: "special-characters",
				severity: 2,
				message: `Escape <script language="jabbascript"> & <span id='foo'>`,
				offset: 14,
				line: 2,
				column: 2,
				size: 1,
				selector: null,
			},
		],
	},
];

export default results;
