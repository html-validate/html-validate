import { defineConfig } from "./define-config";

it("should return itself", () => {
	expect.assertions(1);
	const config = {};
	expect(defineConfig(config)).toBe(config);
});
