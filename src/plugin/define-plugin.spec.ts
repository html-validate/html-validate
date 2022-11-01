import { definePlugin } from "./define-plugin";

it("should pass thru object as is", () => {
	expect.assertions(1);
	const plugin = {
		name: "mock-plugin",
	};
	const result = definePlugin(plugin);
	expect(result).toBe(plugin);
});
