import { HtmlValidate } from "../htmlvalidate";
import "../jest";

const DEFAULT_PATTERN = "^[a-z][a-z0-9\\-._]*-[a-z0-9\\-._]*$";

describe("rule element-name", () => {
	let htmlvalidate: HtmlValidate;

	describe("configured with default pattern", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": "error" },
			});
		});

		it("should report error when custom element name does not have a dash", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <foobar></foobar> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <foobar> is not a valid element name (element-name) at inline:1:3:
				> 1 |  <foobar></foobar>
				    |   ^^^^^^
				Selector: foobar"
			`);
		});

		it("should report error when custom element name does not start with letter", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <1-foo></1-foo> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <1-foo> is not a valid element name (element-name) at inline:1:3:
				> 1 |  <1-foo></1-foo>
				    |   ^^^^^
				Selector: 1-foo"
			`);
		});

		it("should not report error when custom element name is valid", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <foo-bar></foo-bar> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when using builtin elements", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<span>
					<a>
						<span></span>
					</a>
				</span>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for xml namespaces", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <xmlns:foo></xmlns:foo> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/element-name.html");
			expect(report).toMatchInlineCodeframe(`
				"error: <foo> is not a valid element name (element-name) at test-files/rules/element-name.html:30:2:
				  28 |
				  29 | <!-- invalid custom names -->
				> 30 | <foo></foo>
				     |  ^^^
				  31 | <1-bar></1-bar>
				  32 |
				Selector: foo
				error: <1-bar> is not a valid element name (element-name) at test-files/rules/element-name.html:31:2:
				  29 | <!-- invalid custom names -->
				  30 | <foo></foo>
				> 31 | <1-bar></1-bar>
				     |  ^^^^^
				  32 |
				Selector: 1-bar"
			`);
		});
	});

	describe("configured with custom pattern", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": ["error", { pattern: "^foo-\\w+$" }] },
			});
		});

		it("should report error when custom element name does not match pattern", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <spam-ham></spam-ham> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <spam-ham> is not a valid element name (element-name) at inline:1:3:
				> 1 |  <spam-ham></spam-ham>
				    |   ^^^^^^^^
				Selector: spam-ham"
			`);
		});

		it("should not report error when custom element name does match pattern", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <foo-bar></foo-bar> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when using builtin elements", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<span>
					<a>
						<span></span>
					</a>
				</span>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for xml namespaces", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <xmlns:foo></xmlns:foo> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/element-name.html");
			expect(report).toMatchInlineCodeframe(`
				"error: <spam-ham> is not a valid element name (element-name) at test-files/rules/element-name.html:27:2:
				  25 | <!-- allowed custom names -->
				  26 | <foo-bar></foo-bar>
				> 27 | <spam-ham></spam-ham>
				     |  ^^^^^^^^
				  28 |
				  29 | <!-- invalid custom names -->
				  30 | <foo></foo>
				Selector: spam-ham
				error: <foo> is not a valid element name (element-name) at test-files/rules/element-name.html:30:2:
				  28 |
				  29 | <!-- invalid custom names -->
				> 30 | <foo></foo>
				     |  ^^^
				  31 | <1-bar></1-bar>
				  32 |
				Selector: foo
				error: <1-bar> is not a valid element name (element-name) at test-files/rules/element-name.html:31:2:
				  29 | <!-- invalid custom names -->
				  30 | <foo></foo>
				> 31 | <1-bar></1-bar>
				     |  ^^^^^
				  32 |
				Selector: 1-bar"
			`);
		});
	});

	it("should ignore whitelisted element", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "element-name": ["error", { whitelist: ["foobar"] }] },
		});
		const markup = /* HTML */ ` <foobar></foobar> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when using blacklisted element", async () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-name": ["error", { blacklist: ["foo-bar"] }] },
		});
		const markup = /* HTML */ ` <foo-bar></foo-bar> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <foo-bar> element is blacklisted (element-name) at inline:1:3:
			> 1 |  <foo-bar></foo-bar>
			    |   ^^^^^^^
			Selector: foo-bar"
		`);
	});

	describe("should contain documentation for", () => {
		it("blacklisted element", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": "error" },
			});
			const context = {
				tagName: "element-name",
				pattern: DEFAULT_PATTERN,
				blacklist: ["element-name"],
			};
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			const docs = await htmlvalidate.getRuleDocumentation("element-name", null, context);
			expect(docs).toMatchSnapshot();
		});

		it("element not matching default pattern", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": "error" },
			});
			const context = {
				tagName: "element-name",
				pattern: DEFAULT_PATTERN,
				blacklist: [] as string[],
			};
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			const docs = await htmlvalidate.getRuleDocumentation("element-name", null, context);
			expect(docs).toMatchSnapshot();
		});

		it("element not matching custom pattern", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": "error" },
			});
			const context = {
				tagName: "element-name",
				pattern: "^foo-.+$",
				blacklist: [] as string[],
			};
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			const docs = await htmlvalidate.getRuleDocumentation("element-name", null, context);
			expect(docs).toMatchSnapshot();
		});
	});
});
