import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";
import { type AllowList, Style, matchList } from "./allowed-links";

describe("matchList", () => {
	it("should match if no lists are present", () => {
		expect.assertions(1);
		const list: AllowList<RegExp> = {
			include: null,
			exclude: null,
		};
		expect(matchList("foo", list)).toBeTruthy();
	});

	it('should match if value is allowed by one "allow" regexp', () => {
		expect.assertions(5);
		const list: AllowList<RegExp> = {
			include: [/^foo/, /^bar$/],
			exclude: null,
		};
		expect(matchList("foo", list)).toBeTruthy();
		expect(matchList("foobar", list)).toBeTruthy();
		expect(matchList("bar", list)).toBeTruthy();
		expect(matchList("barfoo", list)).toBeFalsy();
		expect(matchList("baz", list)).toBeFalsy();
	});

	it('should match if value is not disallowed by any "disallow" regexp', () => {
		expect.assertions(5);
		const list: AllowList<RegExp> = {
			include: null,
			exclude: [/^foo/, /^bar$/],
		};
		expect(matchList("foo", list)).toBeFalsy();
		expect(matchList("foobar", list)).toBeFalsy();
		expect(matchList("bar", list)).toBeFalsy();
		expect(matchList("barfoo", list)).toBeTruthy();
		expect(matchList("baz", list)).toBeTruthy();
	});

	it('should match if value if both "allow" and "disallow" matches', () => {
		expect.assertions(5);
		const list: AllowList<RegExp> = {
			include: [/^foo/],
			exclude: [/bar$/],
		};
		expect(matchList("foo", list)).toBeTruthy(); // prefix allowed
		expect(matchList("foobar", list)).toBeFalsy(); // suffix disallowd
		expect(matchList("foobaz", list)).toBeTruthy(); // prefix allowed
		expect(matchList("bar", list)).toBeFalsy(); // prefix not allowed
		expect(matchList("barfoo", list)).toBeFalsy(); // prefix not allowed
	});
});

describe("rule allowed-links", () => {
	let htmlvalidate: HtmlValidate;

	describe("should report error for", () => {
		it.each`
			description       | markup
			${"<a href>"}     | ${'<a href="/foo"></a>'}
			${"<img src>"}    | ${'<img src="/foo">'}
			${"<link href>"}  | ${'<link href="/foo">'}
			${"<script src>"} | ${'<script src="/foo"></script>'}
		`("$description", async ({ markup }) => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowAbsolute: false }] },
			});
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
		});
	});

	it("should not report error for anchor links", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "allowed-links": ["error", { allowAbsolute: false }] },
		});
		const markup = /* HTML */ ` <a href="#foo"></a> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for link is dynamic", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"allowed-links": ["error", { allowRelative: false }],
			},
		});
		const markup = /* HTML */ ` <a dynamic-src="{{ expr }}"></a> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	describe("allowExternal: false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowExternal: false }] },
			});
		});

		it("should report error when link is external using //", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <a href="//example.net/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Link destination must not be external url (allowed-links) at inline:1:11:
				> 1 |  <a href="//example.net/foo"></a>
				    |           ^^^^^^^^^^^^^^^^^
				Selector: a"
			`);
		});

		it("should report error when link is external using protocol://", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <a href="http://example.net/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Link destination must not be external url (allowed-links) at inline:1:11:
				> 1 |  <a href="http://example.net/foo"></a>
				    |           ^^^^^^^^^^^^^^^^^^^^^^
				Selector: a"
			`);
		});

		it("should not report error when link is absolute", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when link is relative to path", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="./foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when link is relative to base", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("allowRelative: false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowRelative: false }] },
			});
		});

		it("should not report error when link is external using //", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="//example.net/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when link is external using protocol://", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="http://example.net/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when link is absolute", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when link is relative to path", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <a href="./foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Link destination must not be relative url (allowed-links) at inline:1:11:
				> 1 |  <a href="./foo"></a>
				    |           ^^^^^
				Selector: a"
			`);
		});

		it("should report error when link is relative to base", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <a href="foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Link destination must not be relative url (allowed-links) at inline:1:11:
				> 1 |  <a href="foo"></a>
				    |           ^^^
				Selector: a"
			`);
		});
	});

	describe("allowBase: false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowBase: false }] },
			});
		});

		it("should not report error when link is external using //", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="//example.net/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when link is external using protocol://", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="http://example.net/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when link is absolute", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when link is relative to path", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="./foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when link is relative to base", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <a href="foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Relative links must be relative to current folder (allowed-links) at inline:1:11:
				> 1 |  <a href="foo"></a>
				    |           ^^^
				Selector: a"
			`);
		});
	});

	describe("allowAbsolute: false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowAbsolute: false }] },
			});
		});

		it("should not report error when link is external using //", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="//example.net/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when link is external using protocol://", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="http://example.net/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when link is absolute", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <a href="/foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Link destination must not be absolute url (allowed-links) at inline:1:11:
				> 1 |  <a href="/foo"></a>
				    |           ^^^^
				Selector: a"
			`);
		});

		it("should not report error when link is relative to path", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="./foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when link is relative to base", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="foo"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("include", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: {
					"allowed-links": [
						"error",
						{
							allowExternal: { include: ["^//example.net"] },
							allowRelative: { include: ["\\.png$"] },
							allowAbsolute: { include: ["^/foobar/"] },
						},
					],
				},
			});
		});

		it("should report error when external link is not allowed", async () => {
			expect.assertions(2);
			const markup = '<a href="//example.org/foo"></a>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: External link to this destination is not allowed by current configuration (allowed-links) at inline:1:10:
				> 1 | <a href="//example.org/foo"></a>
				    |          ^^^^^^^^^^^^^^^^^
				Selector: a"
			`);
		});

		it("should report error when relative link is not allowed", async () => {
			expect.assertions(2);
			const markup = '<img src="../foo.jpg">';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Relative link to this destination is not allowed by current configuration (allowed-links) at inline:1:11:
				> 1 | <img src="../foo.jpg">
				    |           ^^^^^^^^^^
				Selector: img"
			`);
		});

		it("should report error when base relative link is not allowed", async () => {
			expect.assertions(2);
			const markup = '<img src="foo.jpg">';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Relative link to this destination is not allowed by current configuration (allowed-links) at inline:1:11:
				> 1 | <img src="foo.jpg">
				    |           ^^^^^^^
				Selector: img"
			`);
		});

		it("should report error when absolute link is not allowed", async () => {
			expect.assertions(2);
			const markup = '<a href="/folder"></a>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Absolute link to this destination is not allowed by current configuration (allowed-links) at inline:1:10:
				> 1 | <a href="/folder"></a>
				    |          ^^^^^^^
				Selector: a"
			`);
		});

		it("should not report error when external link is allowed", async () => {
			expect.assertions(1);
			const markup = '<a href="//example.net/foo"></a>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when relative link is allowed", async () => {
			expect.assertions(1);
			const markup = '<img src="../foo.png">';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when base relative link is allowed", async () => {
			expect.assertions(1);
			const markup = '<img src="foo.png">';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when absolute link is allowed", async () => {
			expect.assertions(1);
			const markup = '<a href="/foobar/baz"></a>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("exclude", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: {
					"allowed-links": [
						"error",
						{
							allowExternal: { exclude: ["^//example.net"] },
							allowRelative: { exclude: ["\\.png$"] },
							allowAbsolute: { exclude: ["^/foobar/"] },
						},
					],
				},
			});
		});

		it("should report error when external link is not allowed", async () => {
			expect.assertions(2);
			const markup = '<a href="//example.net/foo"></a>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: External link to this destination is not allowed by current configuration (allowed-links) at inline:1:10:
				> 1 | <a href="//example.net/foo"></a>
				    |          ^^^^^^^^^^^^^^^^^
				Selector: a"
			`);
		});

		it("should report error when relative link is not allowed", async () => {
			expect.assertions(2);
			const markup = '<img src="../foo.png">';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Relative link to this destination is not allowed by current configuration (allowed-links) at inline:1:11:
				> 1 | <img src="../foo.png">
				    |           ^^^^^^^^^^
				Selector: img"
			`);
		});

		it("should report error when base relative link is not allowed", async () => {
			expect.assertions(2);
			const markup = '<img src="foo.png">';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Relative link to this destination is not allowed by current configuration (allowed-links) at inline:1:11:
				> 1 | <img src="foo.png">
				    |           ^^^^^^^
				Selector: img"
			`);
		});

		it("should report error when absolute link is not allowed", async () => {
			expect.assertions(2);
			const markup = '<a href="/foobar/baz"></a>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Absolute link to this destination is not allowed by current configuration (allowed-links) at inline:1:10:
				> 1 | <a href="/foobar/baz"></a>
				    |          ^^^^^^^^^^^
				Selector: a"
			`);
		});

		it("should not report error when external link is allowed", async () => {
			expect.assertions(1);
			const markup = '<a href="//example.org/foo"></a>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when relative link is allowed", async () => {
			expect.assertions(1);
			const markup = '<img src="../foo.jpg">';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when base relative link is allowed", async () => {
			expect.assertions(1);
			const markup = '<img src="foo.jpg">';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when absolute link is allowed", async () => {
			expect.assertions(1);
			const markup = '<a href="/folder"></a>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "allowed-links": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("allowed-links");
		expect(docs).toMatchSnapshot();
	});

	describe("should contain contextual documentation", () => {
		it.each`
			style                 | value
			${"external"}         | ${Style.EXTERNAL}
			${"relative to base"} | ${Style.RELATIVE_BASE}
			${"relative to path"} | ${Style.RELATIVE_PATH}
			${"absolute"}         | ${Style.ABSOLUTE}
		`("$style", async ({ value }) => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": "error" },
			});
			const docs = await htmlvalidate.getRuleDocumentation("allowed-links", null, value);
			expect(docs).toMatchSnapshot();
		});
	});
});
