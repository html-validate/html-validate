import { ensureError } from "./ensure-error";

it("should return original value if value is Error", () => {
	expect.assertions(2);
	const error = new Error("mock error");
	const converted = ensureError(error);
	expect(converted).toBeInstanceOf(Error);
	expect(converted).toBe(error);
});

it("should convert string to Error", () => {
	expect.assertions(2);
	const converted = ensureError("mock error");
	expect(converted).toBeInstanceOf(Error);
	expect(converted.message).toBe("mock error");
});

it("should convert number to Error", () => {
	expect.assertions(2);
	const converted = ensureError(12);
	expect(converted).toBeInstanceOf(Error);
	expect(converted.message).toBe("12");
});

it("should convert arbitrary value to Error", () => {
	expect.assertions(2);
	const converted = ensureError([1, "foo", { a: false }]);
	expect(converted).toBeInstanceOf(Error);
	expect(converted.message).toBe('[1,"foo",{"a":false}]');
});
