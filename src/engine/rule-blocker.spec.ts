import { createBlocker } from "./rule-blocker";

it("should generate unique id", () => {
	expect.assertions(3);
	const a = createBlocker();
	const b = createBlocker();
	const c = createBlocker();
	expect(a).not.toBe(b);
	expect(a).not.toBe(c);
	expect(b).not.toBe(c);
});
