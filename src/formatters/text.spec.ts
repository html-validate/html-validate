import { edgeCases, emptyMessages, emptyResult, missingSource, regular } from "./__fixtures__";
import formatter from "./text";

describe("text formatter", () => {
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
