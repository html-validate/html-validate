import {
	edgeCases,
	emptyMessages,
	emptyResult,
	missingSource,
	missingUrl,
	regular,
} from "./__fixtures__";
import { type stylish as fn } from "./stylish";

let stylish: typeof fn;

beforeAll(async () => {
	/* force colors on when running stylish tests */
	const defaultColor = process.env.FORCE_COLOR;
	process.env.FORCE_COLOR = "1";

	const module = await import("./stylish");
	stylish = module.stylish;

	/* restore color, need only to be set when importing library */
	process.env.FORCE_COLOR = defaultColor;
});

describe("stylish formatter", () => {
	it("should generate output", () => {
		expect.assertions(1);
		expect(stylish(regular)).toMatchSnapshot();
	});

	it("should handle missing rule url", () => {
		expect.assertions(1);
		expect(stylish(missingUrl)).toMatchSnapshot();
	});

	it("should handle missing source", () => {
		expect.assertions(1);
		expect(stylish(missingSource)).toMatchSnapshot();
	});

	it("should handle edge cases", () => {
		expect.assertions(1);
		expect(stylish(edgeCases)).toMatchSnapshot();
	});

	it("should handle empty result", () => {
		expect.assertions(1);
		expect(stylish(emptyResult)).toMatchSnapshot();
	});

	it("should handle empty messages", () => {
		expect.assertions(1);
		expect(stylish(emptyMessages)).toMatchSnapshot();
	});
});
