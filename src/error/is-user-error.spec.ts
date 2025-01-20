import { InheritError } from "./inherit-error";
import { UserError } from "./user-error";
import { isUserError } from "./is-user-error";

it("should return true when error is UserError", () => {
	expect.assertions(1);
	const error = new UserError("Mock error");
	expect(isUserError(error)).toBeTruthy();
});

it("should return true when error subclassed UserError", () => {
	expect.assertions(1);
	const error = new InheritError({ tagName: "inheriteer", inherit: "inheretee" });
	expect(isUserError(error)).toBeTruthy();
});

it("should return false when error is other Error classes", () => {
	expect.assertions(1);
	const error = new Error("mock error");
	expect(isUserError(error)).toBeFalsy();
});

it("should return false when error is other types", () => {
	expect.assertions(4);
	expect(isUserError("foo")).toBeFalsy();
	expect(isUserError(12)).toBeFalsy();
	expect(isUserError(null)).toBeFalsy();
	expect(isUserError(undefined)).toBeFalsy();
});
