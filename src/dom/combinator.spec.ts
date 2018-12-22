import { Combinator, parseCombinator } from "./combinator";

describe("DOM Combinator", () => {

	it("should default to descendant combinator", () => {
		const result = parseCombinator("");
		expect(result).toEqual(Combinator.DESCENDANT);
	});

	it("should parse > as child combinator", () => {
		const result = parseCombinator(">");
		expect(result).toEqual(Combinator.CHILD);
	});

	it("should parse + as adjacent sibling combinator", () => {
		const result = parseCombinator("+");
		expect(result).toEqual(Combinator.ADJACENT_SIBLING);
	});

	it("should parse + as general sibling combinator", () => {
		const result = parseCombinator("~");
		expect(result).toEqual(Combinator.GENERAL_SIBLING);
	});

	it("should handle undefined as descendant", () => {
		const result = parseCombinator(undefined);
		expect(result).toEqual(Combinator.DESCENDANT);
	});

	it("should handle null as descendant", () => {
		const result = parseCombinator(null);
		expect(result).toEqual(Combinator.DESCENDANT);
	});

	it("should throw error on invalid combinator", () => {
		expect(() => parseCombinator("a")).toThrow();
	});

});
