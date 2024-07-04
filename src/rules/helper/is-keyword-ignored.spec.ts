import {
	type IncludeExcludeOptions,
	isKeywordIgnored,
	keywordPatternMatcher,
} from "./is-keyword-ignored";

it('should return true if keyword is not present in "include"', () => {
	expect.assertions(2);
	const options: IncludeExcludeOptions = {
		include: ["foo"],
		exclude: null,
	};
	expect(isKeywordIgnored(options, "foo")).toBeFalsy();
	expect(isKeywordIgnored(options, "bar")).toBeTruthy();
});

it('should return true if keyword is present in "exclude"', () => {
	expect.assertions(2);
	const options: IncludeExcludeOptions = {
		include: null,
		exclude: ["foo"],
	};
	options.exclude = ["foo"];
	expect(isKeywordIgnored(options, "foo")).toBeTruthy();
	expect(isKeywordIgnored(options, "bar")).toBeFalsy();
});

it('should return true if keyword satisfies both "include" and "exclude"', () => {
	expect.assertions(2);
	const options: IncludeExcludeOptions = {
		include: ["foo", "bar"],
		exclude: ["bar"],
	};
	expect(isKeywordIgnored(options, "foo")).toBeFalsy();
	expect(isKeywordIgnored(options, "bar")).toBeTruthy();
});

describe("keywordPatternMatcher", () => {
	it("should match prefix-*", () => {
		expect.assertions(4);
		const options: IncludeExcludeOptions = {
			include: ["foo-*"],
			exclude: null,
		};
		expect(isKeywordIgnored(options, "foo-bar", keywordPatternMatcher)).toBeFalsy();
		expect(isKeywordIgnored(options, "foo-baz", keywordPatternMatcher)).toBeFalsy();
		expect(isKeywordIgnored(options, "foo-", keywordPatternMatcher)).toBeTruthy();
		expect(isKeywordIgnored(options, "bar", keywordPatternMatcher)).toBeTruthy();
	});

	it("should match *-suffix", () => {
		expect.assertions(4);
		const options: IncludeExcludeOptions = {
			include: ["*-foo"],
			exclude: null,
		};
		expect(isKeywordIgnored(options, "bar-foo", keywordPatternMatcher)).toBeFalsy();
		expect(isKeywordIgnored(options, "baz-foo", keywordPatternMatcher)).toBeFalsy();
		expect(isKeywordIgnored(options, "-foo", keywordPatternMatcher)).toBeTruthy();
		expect(isKeywordIgnored(options, "bar", keywordPatternMatcher)).toBeTruthy();
	});

	it("should match * in-place", () => {
		expect.assertions(4);
		const options: IncludeExcludeOptions = {
			include: ["foo-*-bar"],
			exclude: null,
		};
		expect(isKeywordIgnored(options, "foo-spam-bar", keywordPatternMatcher)).toBeFalsy();
		expect(isKeywordIgnored(options, "foo-ham-bar", keywordPatternMatcher)).toBeFalsy();
		expect(isKeywordIgnored(options, "foo-bar", keywordPatternMatcher)).toBeTruthy();
		expect(isKeywordIgnored(options, "foo--bar", keywordPatternMatcher)).toBeTruthy();
	});

	it("should handle /regexp/", () => {
		expect.assertions(4);
		const options: IncludeExcludeOptions = {
			include: ["/foo-(bar|baz)/"],
			exclude: null,
		};
		expect(isKeywordIgnored(options, "foo-bar", keywordPatternMatcher)).toBeFalsy();
		expect(isKeywordIgnored(options, "foo-baz", keywordPatternMatcher)).toBeFalsy();
		expect(isKeywordIgnored(options, "foo-spam", keywordPatternMatcher)).toBeTruthy();
		expect(isKeywordIgnored(options, "foo-bar-baz", keywordPatternMatcher)).toBeTruthy();
	});
});
