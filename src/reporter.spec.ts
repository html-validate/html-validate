import { type Source } from "./context";
import { type Result, type DeferredMessage, Reporter } from "./reporter";

describe("Reporter", () => {
	describe("merge()", () => {
		it("should set valid only if all reports are valid", () => {
			expect.assertions(3);
			const none = Reporter.merge([
				{ valid: false, results: [], errorCount: 1, warningCount: 2 },
				{ valid: false, results: [], errorCount: 3, warningCount: 4 },
			]);
			const one = Reporter.merge([
				{ valid: true, results: [], errorCount: 0, warningCount: 0 },
				{ valid: false, results: [], errorCount: 1, warningCount: 0 },
			]);
			const all = Reporter.merge([
				{ valid: true, results: [], errorCount: 0, warningCount: 0 },
				{ valid: true, results: [], errorCount: 0, warningCount: 0 },
			]);
			expect(none.valid).toBeFalsy();
			expect(one.valid).toBeFalsy();
			expect(all.valid).toBeTruthy();
		});

		it("should merge and group messages by filename", () => {
			expect.assertions(9);
			const merged = Reporter.merge([
				{
					valid: false,
					results: [createResult("foo", ["fred", "barney"]), createResult("bar", ["spam"])],
					errorCount: 3,
					warningCount: 0,
				},
				{
					valid: false,
					results: [createResult("foo", ["wilma"])],
					errorCount: 1,
					warningCount: 0,
				},
			]);
			expect(merged.results).toHaveLength(2);
			expect(merged.results[0].filePath).toBe("foo");
			expect(merged.results[0].messages.map((x) => x.message)).toEqual(["fred", "barney", "wilma"]);
			expect(merged.results[0].errorCount).toBe(3);
			expect(merged.results[1].filePath).toBe("bar");
			expect(merged.results[1].messages.map((x) => x.message)).toEqual(["spam"]);
			expect(merged.results[1].errorCount).toBe(1);
			expect(merged.errorCount).toBe(4);
			expect(merged.warningCount).toBe(0);
		});

		it("should handle promise with results", async () => {
			expect.assertions(3);
			const merged = await Reporter.merge(
				Promise.resolve([
					{
						valid: false,
						results: [createResult("foo", ["fred", "barney"])],
						errorCount: 1,
						warningCount: 0,
					},
					{
						valid: true,
						results: [createResult("bar", ["wilma"])],
						errorCount: 0,
						warningCount: 1,
					},
				]),
			);
			expect(merged.valid).toBeFalsy();
			expect(merged.results[0].filePath).toBe("foo");
			expect(merged.results[1].filePath).toBe("bar");
		});

		it("should handle array of promises", async () => {
			expect.assertions(3);
			const merged = await Reporter.merge([
				Promise.resolve({
					valid: false,
					results: [createResult("foo", ["fred", "barney"])],
					errorCount: 1,
					warningCount: 0,
				}),
				Promise.resolve({
					valid: true,
					results: [createResult("bar", ["wilma"])],
					errorCount: 0,
					warningCount: 1,
				}),
			]);
			expect(merged.valid).toBeFalsy();
			expect(merged.results[0].filePath).toBe("foo");
			expect(merged.results[1].filePath).toBe("bar");
		});

		it("should handle empty array", () => {
			expect.assertions(1);
			const merged = Reporter.merge([]);
			expect(merged.results).toHaveLength(0);
		});
	});

	describe("save()", () => {
		it("should set valid to true if there are no errors", () => {
			expect.assertions(1);
			const report = new Reporter();
			expect(report.save().valid).toBeTruthy();
		});

		it("should set valid to true if there are only warnings", () => {
			expect.assertions(1);
			const report = new Reporter();
			report.addManual("filename", createMessage("warning", 1));
			expect(report.save().valid).toBeTruthy();
		});

		it("should set valid to false if there are any errors", () => {
			expect.assertions(1);
			const report = new Reporter();
			report.addManual("filename", createMessage("error", 2));
			expect(report.save().valid).toBeFalsy();
		});

		it("should set results", () => {
			expect.assertions(1);
			const report = new Reporter();
			report.addManual("foo.html", createMessage("error", 2));
			report.addManual("foo.html", createMessage("warning", 1));
			report.addManual("bar.html", createMessage("another error", 2));
			expect(report.save().results).toEqual([
				{
					filePath: "foo.html",
					errorCount: 1,
					warningCount: 1,
					messages: [
						{
							offset: 0,
							line: 1,
							column: 1,
							size: 1,
							ruleId: "mock",
							severity: 2,
							message: "error",
							selector: null,
						},
						{
							offset: 0,
							line: 1,
							column: 1,
							size: 1,
							ruleId: "mock",
							severity: 1,
							message: "warning",
							selector: null,
						},
					],
					source: null,
				},
				{
					filePath: "bar.html",
					errorCount: 1,
					warningCount: 0,
					messages: [
						{
							offset: 0,
							line: 1,
							column: 1,
							size: 1,
							ruleId: "mock",
							severity: 2,
							message: "another error",
							selector: null,
						},
					],
					source: null,
				},
			]);
		});

		it("should sort results", () => {
			expect.assertions(1);
			const report = new Reporter();
			report.addManual("foo.html", {
				ruleId: "mock",
				severity: 2,
				message: "c",
				offset: 3,
				line: 2,
				column: 1,
				size: 1,
				selector: () => null,
			});
			report.addManual("foo.html", {
				ruleId: "mock",
				severity: 2,
				message: "b",
				offset: 1,
				line: 1,
				column: 2,
				size: 1,
				selector: () => null,
			});
			report.addManual("foo.html", {
				ruleId: "mock",
				severity: 2,
				message: "a",
				offset: 0,
				line: 1,
				column: 1,
				size: 1,
				selector: () => null,
			});
			expect(report.save().results).toEqual([
				expect.objectContaining({
					filePath: "foo.html",
					messages: [
						expect.objectContaining({ message: "a" }),
						expect.objectContaining({ message: "b" }),
						expect.objectContaining({ message: "c" }),
					],
				}),
			]);
		});

		it("should map filenames to sources", () => {
			expect.assertions(1);
			const report = new Reporter();
			const sources: Source[] = [
				{
					filename: "foo.html",
					data: "<foo></foo>",
					line: 1,
					column: 1,
					offset: 0,
				},
				{
					filename: "bar.html",
					data: "transformed",
					originalData: "<bar></bar>",
					line: 1,
					column: 1,
					offset: 0,
				},
			];
			report.addManual("foo.html", createMessage("error", 1));
			report.addManual("bar.html", createMessage("error", 2));
			expect(report.save(sources).results).toEqual([
				expect.objectContaining({
					filePath: "foo.html",
					source: "<foo></foo>",
				}),
				expect.objectContaining({
					filePath: "bar.html",
					source: "<bar></bar>",
				}),
			]);
		});
	});
});

function createResult(filename: string, messages: string[]): Result {
	return {
		filePath: filename,
		messages: messages.map((cur) => {
			const msg = createMessage(cur);
			return {
				...msg,
				selector: msg.selector(),
			};
		}),
		errorCount: messages.length,
		warningCount: 0,
		source: null,
	};
}

function createMessage(message: string, severity: number = 2): DeferredMessage {
	return {
		ruleId: "mock",
		severity,
		message,
		offset: 0,
		line: 1,
		column: 1,
		size: 1,
		selector: () => null,
	};
}
