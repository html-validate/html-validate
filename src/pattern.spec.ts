import { parsePattern } from "./pattern";

describe("kebabcase", () => {
	it("should match strings with dashes", () => {
		expect.assertions(6);
		const pattern = parsePattern("kebabcase");
		expect("foo-bar").toMatch(pattern.regexp);
		expect("foo-bar-baz-spam-ham").toMatch(pattern.regexp);
		expect("fooBar").not.toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect("foo_bar").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("kebabcase");
	});

	it("should require initial character to be letter", () => {
		expect.assertions(2);
		const pattern = parsePattern("kebabcase");
		expect("foo").toMatch(pattern.regexp);
		expect("5oo").not.toMatch(pattern.regexp);
	});

	it("should not allow leading hyphen", () => {
		expect.assertions(2);
		const pattern = parsePattern("kebabcase");
		expect("foo").toMatch(pattern.regexp);
		expect("-foo").not.toMatch(pattern.regexp);
	});

	it("should not allow trailing hyphen", () => {
		expect.assertions(2);
		const pattern = parsePattern("kebabcase");
		expect("foo").toMatch(pattern.regexp);
		expect("foo-").not.toMatch(pattern.regexp);
	});

	it("should not allow multiple consecutive hyphens", () => {
		expect.assertions(2);
		const pattern = parsePattern("kebabcase");
		expect("foo-bar").toMatch(pattern.regexp);
		expect("foo--bar").not.toMatch(pattern.regexp);
	});
});

describe("camelcase", () => {
	it("should match strings in camelcase", () => {
		expect.assertions(6);
		const pattern = parsePattern("camelcase");
		expect("fooBar").toMatch(pattern.regexp);
		expect("fooBarBazSpamHam").toMatch(pattern.regexp);
		expect("foo-bar").not.toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect("foo_bar").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("camelcase");
	});

	it("should require initial character to be letter", () => {
		expect.assertions(2);
		const pattern = parsePattern("camelcase");
		expect("foo").toMatch(pattern.regexp);
		expect("5oo").not.toMatch(pattern.regexp);
	});
});

describe("snakecase", () => {
	it("should match strings with snakecase", () => {
		expect.assertions(6);
		const pattern = parsePattern("snakecase");
		expect("foo_bar").toMatch(pattern.regexp);
		expect("foo_bar_baz_spam_ham").toMatch(pattern.regexp);
		expect("foo-bar").not.toMatch(pattern.regexp);
		expect("fooBar").not.toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("snakecase");
	});

	it("should require initial character to be letter", () => {
		expect.assertions(2);
		const pattern = parsePattern("snakecase");
		expect("foo").toMatch(pattern.regexp);
		expect("5oo").not.toMatch(pattern.regexp);
	});

	it("should not allow leading underscore", () => {
		expect.assertions(2);
		const pattern = parsePattern("snakecase");
		expect("foo").toMatch(pattern.regexp);
		expect("_foo").not.toMatch(pattern.regexp);
	});

	it("should not allow trailing underscore", () => {
		expect.assertions(2);
		const pattern = parsePattern("snakecase");
		expect("foo").toMatch(pattern.regexp);
		expect("foo_").not.toMatch(pattern.regexp);
	});

	it("should not allow multiple consecutive underscores", () => {
		expect.assertions(2);
		const pattern = parsePattern("snakecase");
		expect("foo_bar").toMatch(pattern.regexp);
		expect("foo__bar").not.toMatch(pattern.regexp);
	});
});

describe("underscore", () => {
	it("should be alias for snakecase", () => {
		expect.assertions(5);
		const pattern = parsePattern("underscore");
		expect("foo_bar").toMatch(pattern.regexp);
		expect("foo-bar").not.toMatch(pattern.regexp);
		expect("fooBar").not.toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("underscore");
	});
});

it("should support user-supplied regexp", () => {
	expect.assertions(4);
	const pattern = parsePattern("^foo-[a-z]\\w+$");
	expect("foo-bar").toMatch(pattern.regexp);
	expect("bar-foo").not.toMatch(pattern.regexp);
	expect("barfoo-baz").not.toMatch(pattern.regexp);
	expect(pattern.description).toBe("/^foo-[a-z]\\w+$/");
});
