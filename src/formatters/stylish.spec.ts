/* force colors on when running stylish tests */
const defaultColor = process.env.FORCE_COLOR;
process.env.FORCE_COLOR = "1";

const formatter = require("./stylish");

/* restore color, need only to be set when importing library */
process.env.FORCE_COLOR = defaultColor;

import { Result } from "../reporter";

describe("stylish formatter", () => {

	it("should generate plaintext", () => {
		const results: Result[] = [
			{filePath: "regular.html", errorCount: 1, warningCount: 1, messages: [
				{ruleId: "foo", severity: 2, message: "An error",  offset: 4,  line: 1, column: 5, size: 1},
				{ruleId: "bar", severity: 1, message: "A warning", offset: 14, line: 2, column: 4, size: 1},
			]},
			{filePath: "edge-cases.html", errorCount: 1, warningCount: 0, messages: [
				{ruleId: "baz", severity: 2, message: "Another error", offset: 14, line: 3, column: 3, size: 1},
			]},
		];
		expect(formatter(results)).toMatchSnapshot();
	});

	it("should empty result", () => {
		const results: Result[] = [];
		expect(formatter(results)).toMatchSnapshot();
	});

	it("should empty messages", () => {
		const results: Result[] = [
			{filePath: "empty.html", messages: []},
		];
		expect(formatter(results)).toMatchSnapshot();
	});

});
