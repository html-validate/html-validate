import { type Message } from "../message";
import { type Result } from "../reporter";
import {
	edgeCases,
	emptyMessages,
	emptyResult,
	missingSelector,
	missingSource,
	missingUrl,
	multiline,
	outOfBounds,
	regular,
	singleChar,
} from "./__fixtures__";
import { type CodeframeOptions, type codeframe as fn } from "./codeframe";

let codeframe: typeof fn;

beforeAll(async () => {
	/* force colors on when running codeframe tests */
	const defaultColor = process.env.FORCE_COLOR;
	process.env.FORCE_COLOR = "1";

	const module = await import("./codeframe");
	codeframe = module.codeframe;

	/* restore color, need only to be set when importing library */
	process.env.FORCE_COLOR = defaultColor;
});

describe("codeframe formatter", () => {
	it("should generate output", () => {
		expect.assertions(1);
		expect(codeframe(regular)).toMatchSnapshot();
	});

	it("should handle multiline error", () => {
		expect.assertions(1);
		expect(codeframe(multiline)).toMatchSnapshot();
	});

	it("should support disabling links", () => {
		expect.assertions(1);
		const options: Partial<CodeframeOptions> = {
			showLink: false,
		};
		expect(codeframe(regular, options)).toMatchSnapshot();
	});

	it("should support disabling summary", () => {
		expect.assertions(1);
		const options: Partial<CodeframeOptions> = {
			showSummary: false,
		};
		expect(codeframe(regular, options)).toMatchSnapshot();
	});

	it("should support enabling selector", () => {
		expect.assertions(1);
		const options: Partial<CodeframeOptions> = {
			showSelector: true,
		};
		expect(codeframe(regular, options)).toMatchSnapshot();
	});

	it("should handle missing selector", () => {
		expect.assertions(1);
		const options: Partial<CodeframeOptions> = {
			showSelector: true,
		};
		expect(codeframe(missingSelector, options)).toMatchSnapshot();
	});

	it("should handle missing rule url", () => {
		expect.assertions(1);
		expect(codeframe(missingUrl)).toMatchSnapshot();
	});

	it("should handle missing source", () => {
		expect.assertions(1);
		expect(codeframe(missingSource)).toMatchSnapshot();
	});

	it("should handle edge cases", () => {
		expect.assertions(1);
		expect(codeframe(edgeCases)).toMatchSnapshot();
	});

	it("should handle empty result", () => {
		expect.assertions(1);
		expect(codeframe(emptyResult)).toMatchSnapshot();
	});

	it("should handle empty messages", () => {
		expect.assertions(1);
		expect(codeframe(emptyMessages)).toMatchSnapshot();
	});

	it("should handle out of bounds errors", () => {
		expect.assertions(1);
		expect(codeframe(outOfBounds)).toMatchSnapshot();
	});

	it("should handle single character source", () => {
		expect.assertions(1);
		expect(codeframe(singleChar)).toMatchSnapshot();
	});

	it("should handle when size is 0", () => {
		expect.assertions(1);
		const result = createError("abc\ndef\nghi\njkl", { line: 2, column: 2, size: 0 });
		expect(codeframe(result, { showSummary: false, showLink: false })).toMatchInlineSnapshot(`
			"<red>error</color>: <bold>Mock error</intensity> <dim>(mock-error)</intensity> at <green>mock-file.html:2:2</color>:
			  1 | abc
			> 2 | def
			    |  ^
			  3 | ghi
			  4 | jkl

			"
		`);
	});

	it("should handle when size is 1", () => {
		expect.assertions(1);
		const result = createError("abc\ndef\nghi\njkl", { line: 2, column: 2, size: 1 });
		expect(codeframe(result, { showSummary: false, showLink: false })).toMatchInlineSnapshot(`
			"<red>error</color>: <bold>Mock error</intensity> <dim>(mock-error)</intensity> at <green>mock-file.html:2:2</color>:
			  1 | abc
			> 2 | def
			    |  ^
			  3 | ghi
			  4 | jkl

			"
		`);
	});

	it("should handle when error stretches over multiple lines", () => {
		expect.assertions(1);
		const result = createError("abc\ndef\nghi\njkl\nmno\n", { line: 2, column: 2, size: 10 });
		expect(codeframe(result, { showSummary: false, showLink: false })).toMatchInlineSnapshot(`
			"<red>error</color>: <bold>Mock error</intensity> <dim>(mock-error)</intensity> at <green>mock-file.html:2:2</color>:
			  1 | abc
			> 2 | def
			    |  ^^
			> 3 | ghi
			    | ^^^
			> 4 | jkl
			    | ^^
			  5 | mno
			  6 |

			"
		`);
	});

	it("should handle when column is 0", () => {
		expect.assertions(1);
		const result = createError("x", { line: 1, column: 1, size: 1 });
		expect(codeframe(result, { showSummary: false, showLink: false })).toMatchInlineSnapshot(`
		"<red>error</color>: <bold>Mock error</intensity> <dim>(mock-error)</intensity> at <green>mock-file.html:1:1</color>:
		> 1 | x
		    | ^

		"
	`);
	});

	it("should handle when size and column is 0", () => {
		expect.assertions(1);
		const result = createError("x", { line: 1, column: 0, size: 0 });
		expect(codeframe(result, { showSummary: false, showLink: false })).toMatchInlineSnapshot(`
		"<red>error</color>: <bold>Mock error</intensity> <dim>(mock-error)</intensity> at <green>mock-file.html</color>:
		> 1 | x

		"
	`);
	});

	it("should handle when column is 0 across multiple lines", () => {
		expect.assertions(1);
		const result = createError("a\nb\nc\nd", { line: 1, column: 0, size: 5 });
		expect(codeframe(result, { showSummary: false, showLink: false })).toMatchInlineSnapshot(`
			"<red>error</color>: <bold>Mock error</intensity> <dim>(mock-error)</intensity> at <green>mock-file.html</color>:
			> 1 | a
			> 2 | b
			> 3 | c
			  4 | d

			"
		`);
	});

	it("should handle when column is out-of-bounds", () => {
		expect.assertions(1);
		const result = createError(
			"x",
			{ line: 1, column: -1, size: 1 },
			{ line: 1, column: 2, size: 1 },
			{ line: 1, column: 14, size: 1 },
		);
		expect(codeframe(result, { showSummary: false, showLink: false })).toMatchInlineSnapshot(`
			"<red>error</color>: <bold>Mock error</intensity> <dim>(mock-error)</intensity> at <green>mock-file.html:1:-1</color>:
			> 1 | x
			    | ^


			<red>error</color>: <bold>Mock error</intensity> <dim>(mock-error)</intensity> at <green>mock-file.html:1:2</color>:
			> 1 | x
			    |  ^


			<red>error</color>: <bold>Mock error</intensity> <dim>(mock-error)</intensity> at <green>mock-file.html:1:14</color>:
			> 1 | x
			    |  ^

			"
		`);
	});
});

function createError(
	markup: string,
	...messages: Array<Pick<Message, "line" | "column" | "size">>
): Result[] {
	const ruleId = "mock-error";
	const ruleUrl = "https://example.net/rule/mock-error.html";
	return [
		{
			filePath: "mock-file.html",
			errorCount: 1,
			warningCount: 1,
			source: markup,
			messages: messages.map((it) => {
				return {
					ruleId,
					ruleUrl,
					severity: 2,
					message: "Mock error",
					offset: 0,
					selector: null,
					...it,
				};
			}),
		},
	];
}
