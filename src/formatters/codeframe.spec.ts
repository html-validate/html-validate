import { edgeCases, emptyMessages, emptyResult, missingSource, regular } from "./__fixtures__";

/* force colors on when running stylish tests */
const defaultColor = process.env.FORCE_COLOR;
process.env.FORCE_COLOR = "1";

import formatter from "./codeframe";

/* restore color, need only to be set when importing library */
process.env.FORCE_COLOR = defaultColor;

describe("codeframe formatter", () => {
	it("should generate output", () => {
		expect.assertions(1);
		expect(formatter(regular)).toMatchSnapshot();
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
