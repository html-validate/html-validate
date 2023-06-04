import { Volume } from "memfs";
import { determineRootDirImpl } from "./determine-root-dir";

it("should return current directory if current directory has a package.json file", () => {
	expect.assertions(2);
	const fs = Volume.fromJSON({
		"/package.json": "{}",
		"/home/foo/projects/foo/package.json": "{}",
	});
	expect(determineRootDirImpl("/", fs)).toBe("/");
	expect(determineRootDirImpl("/home/foo/projects/foo", fs)).toBe("/home/foo/projects/foo");
});

it("should return a parent directory if parent has a package.json file", () => {
	expect.assertions(7);
	const fs = Volume.fromJSON({
		"/package.json": "{}",
		"/home/foo/projects/foo/package.json": "{}",
	});
	expect(determineRootDirImpl("/", fs)).toBe("/");
	expect(determineRootDirImpl("/foo", fs)).toBe("/");
	expect(determineRootDirImpl("/foo/bar", fs)).toBe("/");
	expect(determineRootDirImpl("/foo/bar/baz", fs)).toBe("/");
	expect(determineRootDirImpl("/home/foo/projects/foo", fs)).toBe("/home/foo/projects/foo");
	expect(determineRootDirImpl("/home/foo/projects/foo/bar", fs)).toBe("/home/foo/projects/foo");
	expect(determineRootDirImpl("/home/foo/projects/foo/bar/baz", fs)).toBe("/home/foo/projects/foo");
});

it("should return initial directory if no package.json was found", () => {
	expect.assertions(1);
	const fs = Volume.fromJSON({});
	expect(determineRootDirImpl("/home/foo/projects/foo", fs)).toBe("/home/foo/projects/foo");
});
