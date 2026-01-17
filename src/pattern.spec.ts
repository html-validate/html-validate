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

describe("tailwind", () => {
	it("should match standard kebab-case classes", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("foo-bar").toMatch(pattern.regexp);
		expect("text-blue-500").toMatch(pattern.regexp);
		expect("bg-gray-100").toMatch(pattern.regexp);
		expect(pattern.description).toBe("tailwind");
	});

	it("should match arbitrary values with brackets", () => {
		expect.assertions(5);
		const pattern = parsePattern("tailwind");
		expect("h-[76px]").toMatch(pattern.regexp);
		expect("w-[100%]").toMatch(pattern.regexp);
		expect("text-[14px]").toMatch(pattern.regexp);
		expect("min-h-[calc(100vh-64px)]").toMatch(pattern.regexp);
		expect("p-[2rem]").toMatch(pattern.regexp);
	});

	it("should match fractions", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("top-1/2").toMatch(pattern.regexp);
		expect("w-1/3").toMatch(pattern.regexp);
		expect("translate-x-1/2").toMatch(pattern.regexp);
		expect("left-2/4").toMatch(pattern.regexp);
	});

	it("should match decimals", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("right-2.5").toMatch(pattern.regexp);
		expect("p-3.5").toMatch(pattern.regexp);
		expect("m-1.5").toMatch(pattern.regexp);
		expect("gap-0.5").toMatch(pattern.regexp);
	});

	it("should match negative values with leading dash", () => {
		expect.assertions(5);
		const pattern = parsePattern("tailwind");
		expect("-translate-y-1/2").toMatch(pattern.regexp);
		expect("-mt-4").toMatch(pattern.regexp);
		expect("-ml-2").toMatch(pattern.regexp);
		expect("-top-1").toMatch(pattern.regexp);
		expect("-z-10").toMatch(pattern.regexp);
	});

	it("should match arbitrary hex colors", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("text-[001C3F]").toMatch(pattern.regexp);
		expect("bg-[#ff0000]").toMatch(pattern.regexp);
		expect("text-[#000]").toMatch(pattern.regexp);
		expect("border-[#00ff00]").toMatch(pattern.regexp);
	});

	it("should match variant modifiers with colon", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("hover:bg-blue-500").toMatch(pattern.regexp);
		expect("dark:text-white").toMatch(pattern.regexp);
		expect("md:flex").toMatch(pattern.regexp);
		expect("focus:outline-none").toMatch(pattern.regexp);
	});

	it("should match complex combinations", () => {
		expect.assertions(6);
		const pattern = parsePattern("tailwind");
		expect("md:hover:bg-[#ff0000]").toMatch(pattern.regexp);
		expect("dark:md:text-[18px]").toMatch(pattern.regexp);
		expect("lg:-translate-x-1/2").toMatch(pattern.regexp);
		expect("sm:w-[calc(100%-2rem)]").toMatch(pattern.regexp);
		expect("xl:p-2.5").toMatch(pattern.regexp);
		expect("2xl:gap-0.5").toMatch(pattern.regexp);
	});

	it("should not match uppercase letters at start", () => {
		expect.assertions(2);
		const pattern = parsePattern("tailwind");
		expect("Foo-bar").not.toMatch(pattern.regexp);
		expect("BgBlue").not.toMatch(pattern.regexp);
	});

	it("should not match starting with digit", () => {
		expect.assertions(1);
		const pattern = parsePattern("tailwind");
		expect("5xl").not.toMatch(pattern.regexp);
	});

	it("should match single letter", () => {
		expect.assertions(1);
		const pattern = parsePattern("tailwind");
		expect("p").toMatch(pattern.regexp);
	});

	it("should match pseudo-elements before and after", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("before:content-['Festivus']").toMatch(pattern.regexp);
		expect("after:content-['']").toMatch(pattern.regexp);
		expect("before:block").toMatch(pattern.regexp);
		expect("after:absolute").toMatch(pattern.regexp);
	});

	it("should match css variables in parentheses", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("fill-(--my-brand-color)").toMatch(pattern.regexp);
		expect("bg-(--custom-bg)").toMatch(pattern.regexp);
		expect("text-(--heading-color)").toMatch(pattern.regexp);
		expect("border-(--theme-border)").toMatch(pattern.regexp);
	});

	it("should match css variables in brackets with var()", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("fill-[var(--my-brand-color)]").toMatch(pattern.regexp);
		expect("bg-[var(--custom-bg)]").toMatch(pattern.regexp);
		expect("text-[var(--heading-color)]").toMatch(pattern.regexp);
		expect("w-[var(--sidebar-width)]").toMatch(pattern.regexp);
	});

	it("should match arbitrary properties", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("[mask-type:luminance]").toMatch(pattern.regexp);
		expect("[appearance:textfield]").toMatch(pattern.regexp);
		expect("[clip-path:circle(50%)]").toMatch(pattern.regexp);
		expect("[transform-style:preserve-3d]").toMatch(pattern.regexp);
	});

	it("should match arbitrary properties with variants", () => {
		expect.assertions(3);
		const pattern = parsePattern("tailwind");
		expect("hover:[mask-type:alpha]").toMatch(pattern.regexp);
		expect("focus:[outline-style:dashed]").toMatch(pattern.regexp);
		expect("dark:[color-scheme:dark]").toMatch(pattern.regexp);
	});

	it("should match arbitrary variants", () => {
		expect.assertions(5);
		const pattern = parsePattern("tailwind");
		expect("[&.is-dragging]:cursor-grabbing").toMatch(pattern.regexp);
		expect("[&:nth-child(3)]:py-0").toMatch(pattern.regexp);
		expect("[&>svg]:fill-current").toMatch(pattern.regexp);
		expect("[&_p]:mt-0").toMatch(pattern.regexp);
		expect("[&::before]:content-['']").toMatch(pattern.regexp);
	});

	it("should match whitespace handling with underscores", () => {
		expect.assertions(5);
		const pattern = parsePattern("tailwind");
		expect("grid-cols-[1fr_500px_2fr]").toMatch(pattern.regexp);
		expect("grid-rows-[auto_1fr_auto]").toMatch(pattern.regexp);
		expect("content-['Hello_World']").toMatch(pattern.regexp);
		expect("font-family-[ui-sans-serif,_system-ui]").toMatch(pattern.regexp);
		expect("bg-[linear-gradient(to_right,_#000,_#fff)]").toMatch(pattern.regexp);
	});

	it("should match data types with parentheses", () => {
		expect.assertions(5);
		const pattern = parsePattern("tailwind");
		expect("text-(length:--my-var)").toMatch(pattern.regexp);
		expect("text-(color:--my-var)").toMatch(pattern.regexp);
		expect("bg-(color:--brand-primary)").toMatch(pattern.regexp);
		expect("w-(length:--sidebar)").toMatch(pattern.regexp);
		expect("shadow-(shadow:--custom-shadow)").toMatch(pattern.regexp);
	});

	it("should match important modifier with exclamation mark", () => {
		expect.assertions(5);
		const pattern = parsePattern("tailwind");
		expect("!bg-red-500").toMatch(pattern.regexp);
		expect("!text-white").toMatch(pattern.regexp);
		expect("!p-4").toMatch(pattern.regexp);
		expect("!hidden").toMatch(pattern.regexp);
		expect("hover:!bg-blue-500").toMatch(pattern.regexp);
	});

	it("should match peer and group variants", () => {
		expect.assertions(6);
		const pattern = parsePattern("tailwind");
		expect("peer-checked:bg-blue-500").toMatch(pattern.regexp);
		expect("peer-focus:ring-2").toMatch(pattern.regexp);
		expect("group-hover:text-white").toMatch(pattern.regexp);
		expect("group-active:opacity-75").toMatch(pattern.regexp);
		expect("peer-disabled:opacity-50").toMatch(pattern.regexp);
		expect("group-focus-within:ring-1").toMatch(pattern.regexp);
	});

	it("should match opacity modifiers with slash", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("bg-blue-500/50").toMatch(pattern.regexp);
		expect("text-red-600/75").toMatch(pattern.regexp);
		expect("border-gray-300/25").toMatch(pattern.regexp);
		expect("bg-[#ff0000]/80").toMatch(pattern.regexp);
	});

	it("should match max/min screen variants", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("max-md:hidden").toMatch(pattern.regexp);
		expect("min-lg:flex").toMatch(pattern.regexp);
		expect("max-sm:text-xs").toMatch(pattern.regexp);
		expect("min-2xl:grid-cols-4").toMatch(pattern.regexp);
	});

	it("should match stacked complex variants", () => {
		expect.assertions(4);
		const pattern = parsePattern("tailwind");
		expect("dark:md:hover:bg-blue-500").toMatch(pattern.regexp);
		expect("sm:max-md:p-4").toMatch(pattern.regexp);
		expect("lg:peer-checked:bg-green-500").toMatch(pattern.regexp);
		expect("group-hover:dark:text-white").toMatch(pattern.regexp);
	});
});

it("should support user-supplied regexp (string)", () => {
	expect.assertions(4);
	const pattern = parsePattern("/^foo-[a-z]\\w+$/");
	expect("foo-bar").toMatch(pattern.regexp);
	expect("bar-foo").not.toMatch(pattern.regexp);
	expect("barfoo-baz").not.toMatch(pattern.regexp);
	expect(pattern.description).toBe("/^foo-[a-z]\\w+$/");
});

it("should support user-supplied regexp (RegExp object)", () => {
	expect.assertions(4);
	const pattern = parsePattern(/^foo-[a-z]\w+$/);
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
