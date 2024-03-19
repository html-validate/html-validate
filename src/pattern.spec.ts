import { parsePattern } from "./pattern";

describe("parsePattern", () => {
	it("kebabcase should match strings with dashes", () => {
		expect.assertions(5);
		const pattern = parsePattern("kebabcase");
		expect("foo-bar").toMatch(pattern.regexp);
		expect("fooBar").not.toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect("foo_bar").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("kebabcase");
	});

	it("camelcase should match strings in camelcase", () => {
		expect.assertions(5);
		const pattern = parsePattern("camelcase");
		expect("foo-bar").not.toMatch(pattern.regexp);
		expect("fooBar").toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect("foo_bar").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("camelcase");
	});

	it("underscore should match strings with underscore", () => {
		expect.assertions(5);
		const pattern = parsePattern("underscore");
		expect("foo-bar").not.toMatch(pattern.regexp);
		expect("fooBar").not.toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect("foo_bar").toMatch(pattern.regexp);
		expect(pattern.description).toBe("underscore");
	});

	it("should support user-supplied regexp", () => {
		expect.assertions(4);
		const pattern = parsePattern("^foo-[a-z]\\w+$");
		expect("foo-bar").toMatch(pattern.regexp);
		expect("bar-foo").not.toMatch(pattern.regexp);
		expect("barfoo-baz").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("/^foo-[a-z]\\w+$/");
	});
});
