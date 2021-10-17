import { NestedError } from "./nested-error";

describe("NestedError", () => {
	it("stack should include nested error", () => {
		expect.assertions(3);
		const original = new Error("original error");
		const err = new NestedError("nested error", original);
		expect(err.message).toBe("nested error");
		expect(err.stack).toContain("nested error");
		expect(err.stack).toContain("original error");
	});

	it("stack should handle missing nested", () => {
		expect.assertions(3);
		const err = new NestedError("nested error", undefined);
		expect(err.message).toBe("nested error");
		expect(err.stack).toContain("nested error");
		expect(err.stack).not.toContain("Caused by");
	});
});
