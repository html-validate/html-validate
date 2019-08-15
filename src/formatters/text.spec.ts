import { Result } from "../reporter";
import formatter from "./text";

describe("text formatter", () => {
	it("should generate plaintext", () => {
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
					},
					{
						ruleId: "bar",
						severity: 1,
						message: "A warning",
						offset: 14,
						line: 2,
						column: 4,
						size: 1,
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
					},
				],
			},
		];
		expect(formatter(results)).toMatchSnapshot();
	});

	it("should empty result", () => {
		const results: Result[] = [];
		expect(formatter(results)).toMatchSnapshot();
	});

	it("should empty messages", () => {
		const results: Result[] = [
			{ filePath: "empty.html", messages: [], errorCount: 0, warningCount: 0 },
		];
		expect(formatter(results)).toMatchSnapshot();
	});
});
