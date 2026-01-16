import { parsePattern } from "./pattern";

afterEach(() => {
	jest.restoreAllMocks();
});

describe("kebabcase", () => {
	it("should match strings with dashes", () => {
		expect.assertions(7);
		const pattern = parsePattern("kebabcase");
		expect("foo").toMatch(pattern.regexp);
		expect("foo-bar").toMatch(pattern.regexp);
		expect("foo-bar-baz-spam-ham").toMatch(pattern.regexp);
		expect("fooBar").not.toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect("foo_bar").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("kebabcase");
	});

	it("should allow single letter", () => {
		expect.assertions(1);
		const pattern = parsePattern("kebabcase");
		expect("a").toMatch(pattern.regexp);
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
		expect.assertions(7);
		const pattern = parsePattern("camelcase");
		expect("foo").toMatch(pattern.regexp);
		expect("fooBar").toMatch(pattern.regexp);
		expect("fooBarBazSpamHam").toMatch(pattern.regexp);
		expect("foo-bar").not.toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect("foo_bar").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("camelcase");
	});

	it("should allow single letter", () => {
		expect.assertions(1);
		const pattern = parsePattern("camelcase");
		expect("a").toMatch(pattern.regexp);
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
		expect.assertions(7);
		const pattern = parsePattern("snakecase");
		expect("foo").toMatch(pattern.regexp);
		expect("foo_bar").toMatch(pattern.regexp);
		expect("foo_bar_baz_spam_ham").toMatch(pattern.regexp);
		expect("foo-bar").not.toMatch(pattern.regexp);
		expect("fooBar").not.toMatch(pattern.regexp);
		expect("Foobar").not.toMatch(pattern.regexp);
		expect(pattern.description).toBe("snakecase");
	});

	it("should allow single letter", () => {
		expect.assertions(1);
		const pattern = parsePattern("snakecase");
		expect("a").toMatch(pattern.regexp);
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

describe("bem", () => {
	it("should match strings with BEM naming convention", () => {
		expect.assertions(15);
		const pattern = parsePattern("bem");
		expect("block").toMatch(pattern.regexp);
		expect("block--mod").toMatch(pattern.regexp);
		expect("block__elem").toMatch(pattern.regexp);
		expect("block__elem--mod").toMatch(pattern.regexp);
		expect("block-name").toMatch(pattern.regexp);
		expect("block-name--mod").toMatch(pattern.regexp);
		expect("block-name__elem").toMatch(pattern.regexp);
		expect("block-name__elem--mod").toMatch(pattern.regexp);
		expect("block--mod-name").toMatch(pattern.regexp);
		expect("block__elem-name").toMatch(pattern.regexp);
		expect("block__elem-name--mod-name").toMatch(pattern.regexp);
		expect("block-name--mod-name").toMatch(pattern.regexp);
		expect("block-name__elem-name").toMatch(pattern.regexp);
		expect("block-name__elem-name--mod-name").toMatch(pattern.regexp);

		expect(pattern.description).toBe("bem");
	});

	it("should not match camelcase", () => {
		expect.assertions(1);
		const pattern = parsePattern("bem");
		expect("blockBar").not.toMatch(pattern.regexp);
	});

	it("should not match pascalcase", () => {
		expect.assertions(1);
		const pattern = parsePattern("bem");
		expect("Blockbar").not.toMatch(pattern.regexp);
	});

	it("should allow single letter", () => {
		expect.assertions(1);
		const pattern = parsePattern("bem");
		expect("a").toMatch(pattern.regexp);
	});

	it("should require initial character to be letter", () => {
		expect.assertions(2);
		const pattern = parsePattern("bem");
		expect("foo").toMatch(pattern.regexp);
		expect("5oo").not.toMatch(pattern.regexp);
	});

	it("should not allow leading hyphen or underscore", () => {
		expect.assertions(3);
		const pattern = parsePattern("bem");
		expect("foo").toMatch(pattern.regexp);
		expect("-foo").not.toMatch(pattern.regexp);
		expect("_foo").not.toMatch(pattern.regexp);
	});

	it("should not allow trailing hyphen or underscore", () => {
		expect.assertions(3);
		const pattern = parsePattern("bem");
		expect("foo").toMatch(pattern.regexp);
		expect("foo-").not.toMatch(pattern.regexp);
		expect("foo_").not.toMatch(pattern.regexp);
	});

	it("should not allow single underscore", () => {
		expect.assertions(1);
		const pattern = parsePattern("bem");
		expect("foo_bar").not.toMatch(pattern.regexp);
	});

	it("should not allow 3 or more consecutive underscores", () => {
		expect.assertions(2);
		const pattern = parsePattern("bem");
		expect("foo__bar").toMatch(pattern.regexp);
		expect("foo___bar").not.toMatch(pattern.regexp);
	});

	it("should not allow 3 or more consecutive hyphens", () => {
		expect.assertions(2);
		const pattern = parsePattern("bem");
		expect("foo--bar").toMatch(pattern.regexp);
		expect("foo---bar").not.toMatch(pattern.regexp);
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
	const pattern = parsePattern("/^foo-[a-z]\\w+$/");
	expect("foo-bar").toMatch(pattern.regexp);
	expect("bar-foo").not.toMatch(pattern.regexp);
	expect("barfoo-baz").not.toMatch(pattern.regexp);
	expect(pattern.description).toBe("/^foo-[a-z]\\w+$/");
});

it("should support user-supplied regexp (deprecated unwrapped string)", () => {
	expect.assertions(5);
	const spy = jest.spyOn(console, "warn").mockImplementation();
	/* @ts-expect-error deprecated but should still work */
	const pattern = parsePattern("^foo-[a-z]\\w+$");
	expect("foo-bar").toMatch(pattern.regexp);
	expect("bar-foo").not.toMatch(pattern.regexp);
	expect(pattern.description).toBe("/^foo-[a-z]\\w+$/");
	expect(spy).toHaveBeenCalledTimes(1);
	expect(spy).toHaveBeenCalledWith(
		'Custom pattern "^foo-[a-z]\\w+$" should be wrapped in forward slashes, e.g., "/^foo-[a-z]\\w+$/". Support for unwrapped patterns is deprecated and will be removed in a future version.',
	);
});
