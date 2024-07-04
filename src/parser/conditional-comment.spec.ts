import { type Location } from "../context";
import { parseConditionalComment } from "./conditional-comment";

function mockLocation(text: string): Location {
	return {
		filename: "mock",
		line: 1,
		column: 1,
		offset: 0,
		size: text.length,
	};
}

describe("parseConditionalComment()", () => {
	it("should find conditions", () => {
		expect.assertions(1);
		const comment = "<!--[if gt IE 6]><!-->foo<!--<![endif]-->";
		const location = mockLocation(comment);
		const conditions = Array.from(parseConditionalComment(comment, location));
		expect(conditions).toEqual([
			{
				expression: "if gt IE 6",
				location: expect.objectContaining({
					line: 1,
					column: 1,
					offset: 0,
					size: 17,
				}),
			},
			{
				expression: "endif",
				location: expect.objectContaining({
					line: 1,
					column: 30,
					offset: 29,
					size: 12,
				}),
			},
		]);
	});
});
