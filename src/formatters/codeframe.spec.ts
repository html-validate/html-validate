import {
	edgeCases,
	emptyMessages,
	emptyResult,
	missingSelector,
	missingSource,
	missingUrl,
	multiline,
	regular,
} from "./__fixtures__";

/* force colors on when running stylish tests */
const defaultColor = process.env.FORCE_COLOR;
process.env.FORCE_COLOR = "1";

import { type CodeframeOptions, codeframe } from "./codeframe";

/* restore color, need only to be set when importing library */
process.env.FORCE_COLOR = defaultColor;

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
});
