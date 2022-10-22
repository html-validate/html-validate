import { defineMetadata } from "./define-metadata";

it("should pass thru object as is", () => {
	expect.assertions(1);
	const metatable = {
		div: {
			flow: true,
		},
	};
	const result = defineMetadata(metatable);
	expect(result).toBe(metatable);
});
