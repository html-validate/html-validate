import { expect, it } from "@jest/globals";
import { parseImageCandidateString } from "./parse-image-candidate-string";

it("should return an empty array for an empty string", () => {
	expect.assertions(1);
	expect(parseImageCandidateString("")).toEqual([]);
});

it("should retain empty candidates from extra commas", () => {
	expect.assertions(1);
	expect(parseImageCandidateString("foo.png 400w,")).toEqual([
		{ url: "foo.png", descriptor: "width", raw: "400w", value: 400 },
		{ url: "", descriptor: "none", raw: null },
	]);
});

it("should include candidates without descriptors", () => {
	expect.assertions(1);
	expect(parseImageCandidateString("foo.png, bar.png")).toEqual([
		{ url: "foo.png", descriptor: "none", raw: null },
		{ url: "bar.png", descriptor: "none", raw: null },
	]);
});

it("should parse width descriptors", () => {
	expect.assertions(1);
	expect(parseImageCandidateString("foo.png 400w, bar.png 800w")).toEqual([
		{ url: "foo.png", descriptor: "width", raw: "400w", value: 400 },
		{ url: "bar.png", descriptor: "width", raw: "800w", value: 800 },
	]);
});

it("should parse density descriptors", () => {
	expect.assertions(1);
	expect(parseImageCandidateString("foo.png, bar.png 2x, baz.png 1.5x")).toEqual([
		{ url: "foo.png", descriptor: "none", raw: null },
		{ url: "bar.png", descriptor: "density", raw: "2x", value: 2 },
		{ url: "baz.png", descriptor: "density", raw: "1.5x", value: 1.5 },
	]);
});

it("should include candidates with invalid descriptors as descriptor-less", () => {
	expect.assertions(1);
	expect(parseImageCandidateString("foo.png 100h, bar.png invalid, baz.png 600w")).toEqual([
		{ url: "foo.png", descriptor: "none", raw: "100h" },
		{ url: "bar.png", descriptor: "none", raw: "invalid" },
		{ url: "baz.png", descriptor: "width", raw: "600w", value: 600 },
	]);
});

it("should handle surrounding whitespace", () => {
	expect.assertions(1);
	expect(parseImageCandidateString("  foo.png 400w ,  bar.png 2x  ")).toEqual([
		{ url: "foo.png", descriptor: "width", raw: "400w", value: 400 },
		{ url: "bar.png", descriptor: "density", raw: "2x", value: 2 },
	]);
});
