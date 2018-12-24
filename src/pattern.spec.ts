import { describePattern, parsePattern } from "./pattern";

describe("parsePattern", () => {

	it("kebabcase should match strings with dashes", () => {
		const pattern = parsePattern("kebabcase");
		expect("foo-bar").toMatch(pattern);
		expect("fooBar").not.toMatch(pattern);
		expect("Foobar").not.toMatch(pattern);
		expect("foo_bar").not.toMatch(pattern);
	});

	it("camelcase should match strings in camelcase", () => {
		const pattern = parsePattern("camelcase");
		expect("foo-bar").not.toMatch(pattern);
		expect("fooBar").toMatch(pattern);
		expect("Foobar").not.toMatch(pattern);
		expect("foo_bar").not.toMatch(pattern);
	});

	it("underscore should match strings with underscore", () => {
		const pattern = parsePattern("underscore");
		expect("foo-bar").not.toMatch(pattern);
		expect("fooBar").not.toMatch(pattern);
		expect("Foobar").not.toMatch(pattern);
		expect("foo_bar").toMatch(pattern);
	});

	it("should support user-supplied regexp", () => {
		const pattern = parsePattern("^foo-[a-z]\\w+$");
		expect("foo-bar").toMatch(pattern);
		expect("bar-foo").not.toMatch(pattern);
		expect("barfoo-baz").not.toMatch(pattern);
	});

});

describe("describePattern()", () => {

	it("should show description for named patterns", () => {
		expect(describePattern("kebabcase")).toMatch(/\/.*\/ \(kebabcase\)/);
	});

	it("should show description for user-supplied regexp", () => {
		expect(describePattern("^foo-[a-z]\\w+$")).toMatch("/^foo-[a-z]\\w+$/");
	});

});
