import { isThenable } from "./is-thenable";

it("should return true if given a promise", () => {
	expect.assertions(1);
	const value = Promise.resolve("foo");
	expect(isThenable(value)).toBeTruthy();
});

it("should return false if given a primitive value", () => {
	expect.assertions(1);
	const value = "foo";
	expect(isThenable(value)).toBeFalsy();
});
