import {
	edgeCases,
	emptyMessages,
	emptyResult,
	missingSource,
	missingUrl,
	regular,
} from "./__fixtures__";
import formatter from "./json";

describe("json formatter", () => {
	it("should generate output", () => {
		expect.assertions(1);
		expect(formatter(regular)).toMatchSnapshot();
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
