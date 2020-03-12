import { Combinator, parseCombinator } from "./combinator";

describe("DOM Combinator", () => {
	it("should default to descendant combinator", () => {
		expect.assertions(1);
		const result = parseCombinator("");
		expect(result).toEqual(Combinator.DESCENDANT);
	});

	it("should parse > as child combinator", () => {
		expect.assertions(1);
		const result = parseCombinator(">");
		expect(result).toEqual(Combinator.CHILD);
	});

	it("should parse + as adjacent sibling combinator", () => {
		expect.assertions(1);
		const result = parseCombinator("+");
		expect(result).toEqual(Combinator.ADJACENT_SIBLING);
	});

	it("should parse + as general sibling combinator", () => {
		expect.assertions(1);
		const result = parseCombinator("~");
		expect(result).toEqual(Combinator.GENERAL_SIBLING);
	});

	it("should handle undefined as descendant", () => {
		expect.assertions(1);
		const result = parseCombinator(undefined);
		expect(result).toEqual(Combinator.DESCENDANT);
	});

	it("should handle null as descendant", () => {
		expect.assertions(1);
		const result = parseCombinator(null);
		expect(result).toEqual(Combinator.DESCENDANT);
	});

	it("should throw error on invalid combinator", () => {
		expect.assertions(1);
		expect(() => parseCombinator("a")).toThrow();
	});
});
