import { describe, expect, it } from "@jest/globals";
import { generateIdSelector } from "./generate-id-selector";

describe("generateIdSelector()", () => {
	it("should escape characters", () => {
		expect.assertions(1);
		const id = "foo:bar[baz]";
		expect(generateIdSelector(id)).toBe("#foo\\:bar\\[baz\\]");
	});

	it("should handle leading digits", () => {
		expect.assertions(1);
		const id = "123foo";
		expect(generateIdSelector(id)).toBe('[id="123foo"]');
	});

	it("should handle comma", () => {
		expect.assertions(1);
		const id = "foo,bar";
		expect(generateIdSelector(id)).toBe("#foo\\,bar");
	});

	it("should handle leading digits and comma", () => {
		expect.assertions(1);
		const id = "1foo,bar";
		expect(generateIdSelector(id)).toBe('[id="1foo\\,bar"]');
	});
});
