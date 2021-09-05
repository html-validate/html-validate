import { isThenable } from "./is-thenable";

it("should return true if passing a Promise", () => {
	expect.assertions(1);
	const promise = Promise.resolve();
	expect(isThenable(promise)).toBeTruthy();
});

it("should return false if passing object", () => {
	expect.assertions(1);
	const obj = {};
	expect(isThenable(obj)).toBeFalsy();
});

it.each`
	value        | description
	${null}      | ${"null"}
	${undefined} | ${"undefined"}
`("should handle $description", ({ value }) => {
	expect.assertions(1);
	expect(isThenable(value)).toBeFalsy();
});
