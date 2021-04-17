import {
	edgeCases,
	emptyMessages,
	emptyResult,
	missingSource,
	missingUrl,
	regular,
} from "./__fixtures__";

/* force colors on when running stylish tests */
const defaultColor = process.env.FORCE_COLOR;
process.env.FORCE_COLOR = "1";

import formatter, { codeframe, CodeframeOptions } from "./codeframe";

/* restore color, need only to be set when importing library */
process.env.FORCE_COLOR = defaultColor;

describe("codeframe formatter", () => {
	it("should generate output", () => {
		expect.assertions(1);
		expect(formatter(regular)).toMatchSnapshot();
	});

	it("should support disabling links", () => {
		expect.assertions(1);
		const options: CodeframeOptions = {
			showLink: false,
		};
		expect(codeframe(regular, options)).toMatchSnapshot();
	});

	it("should handle missing rule url", () => {
		expect.assertions(1);
		expect(formatter(missingUrl)).toMatchSnapshot();
	});

	it("should handle missing source", () => {
		expect.assertions(1);
		expect(formatter(missingSource)).toMatchSnapshot();
	});

	it("should handle edge cases", () => {
		expect.assertions(1);
		expect(formatter(edgeCases)).toMatchSnapshot();
	});

	it("should handle empty result", () => {
		expect.assertions(1);
		expect(formatter(emptyResult)).toMatchSnapshot();
	});

	it("should handle empty messages", () => {
		expect.assertions(1);
		expect(formatter(emptyMessages)).toMatchSnapshot();
	});
});
