import { Result } from "../reporter";
import formatter from "./checkstyle";

describe("checkstyle formatter", () => {
	it("should generate checkstyle xml", () => {
		expect.assertions(1);
		const results: Result[] = [
			{
				filePath: "regular.html",
				errorCount: 1,
				warningCount: 0,
				source: null,
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
						offset: 12,
						line: 2,
						column: 4,
						size: 1,
						selector: null,
					},
				],
			},
			{
				filePath: "edge-cases.html",
				errorCount: 2,
				warningCount: 0,
				source: null,
				messages: [
					{
						ruleId: "foo",
						severity: 3,
						message: "Has invalid severity",
						offset: 0,
						line: 1,
						column: 1,
						size: 1,
						selector: null,
					},
					{
						ruleId: "bar",
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
			{ filePath: "empty.html", messages: [], errorCount: 0, warningCount: 0, source: null },
		];
		expect(formatter(results)).toMatchSnapshot();
	});
});
