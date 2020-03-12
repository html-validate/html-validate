import { Result } from "../reporter";

/* force colors on when running stylish tests */
const defaultColor = process.env.FORCE_COLOR;
process.env.FORCE_COLOR = "1";

import formatter from "./stylish";

/* restore color, need only to be set when importing library */
process.env.FORCE_COLOR = defaultColor;

describe("stylish formatter", () => {
	it("should generate plaintext", () => {
		expect.assertions(1);
		const results: Result[] = [
			{
				filePath: "regular.html",
				errorCount: 1,
				warningCount: 1,
				messages: [
					{
						ruleId: "foo",
						severity: 2,
						message: "An error",
						offset: 4,
						line: 1,
						column: 5,
						size: 1,
						selector: null,
					},
					{
						ruleId: "bar",
						severity: 1,
						message: "A warning",
						offset: 14,
						line: 2,
						column: 4,
						size: 1,
						selector: null,
					},
				],
			},
			{
				filePath: "edge-cases.html",
				errorCount: 1,
				warningCount: 0,
				messages: [
					{
						ruleId: "baz",
						severity: 2,
						message: "Another error",
						offset: 14,
						line: 3,
						column: 3,
						size: 1,
						selector: null,
					},
				],
			},
		];
		expect(formatter(results)).toMatchSnapshot();
	});

	it("should empty result", () => {
		expect.assertions(1);
		const results: Result[] = [];
		expect(formatter(results)).toMatchSnapshot();
	});

	it("should empty messages", () => {
		expect.assertions(1);
		const results: Result[] = [
			{ filePath: "empty.html", messages: [], errorCount: 0, warningCount: 0 },
		];
		expect(formatter(results)).toMatchSnapshot();
	});
});
