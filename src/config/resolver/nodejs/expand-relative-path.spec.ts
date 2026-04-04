import path from "node:path";
import { expect, it } from "@jest/globals";
import { expandRelativePath } from "./expand-relative-path";

it("should expand ./foo", () => {
	expect.assertions(1);
	const result = expandRelativePath("./foo", { cwd: "/path" });
	expect(result).toEqual(path.join(path.sep, "path", "foo"));
});

it("should expand ../foo", () => {
	expect.assertions(1);
	const result = expandRelativePath("../foo", { cwd: "/path/bar" });
	expect(result).toEqual(path.join(path.sep, "path", "foo"));
});

it("should not expand /foo", () => {
	expect.assertions(1);
	const result = expandRelativePath("/foo", { cwd: "/path" });
	expect(result).toBe("/foo");
});

it("should not expand foo", () => {
	expect.assertions(1);
	const result = expandRelativePath("foo", { cwd: "/path" });
	expect(result).toBe("foo");
});
