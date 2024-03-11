import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule meta-refresh", () => {
	let htmlvalidate: HtmlValidate;

	beforeEach(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "meta-refresh": "error" },
		});
	});

	it("should not report error when refresh has 0 delay with url", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <meta http-equiv="refresh" content="0;url=target.html" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when refresh has 0 delay with url (case-insensitive)", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <meta http-equiv="refresh" content="0;URL=target.html" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for other http-equiv", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <meta http-equiv="foo" content="1" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when refresh is missing content attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <meta http-equiv="refresh" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when refresh has boolean content attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <meta http-equiv="refresh" content /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when refresh has empty content attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <meta http-equiv="refresh" content="" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div http-equiv="refresh" content="1;url=target.html"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when refresh is missing url", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <meta http-equiv="refresh" content="0" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Don't use instant meta refresh to reload the page (meta-refresh) at inline:1:38:
			> 1 |  <meta http-equiv="refresh" content="0" />
			    |                                      ^
			Selector: meta"
		`);
	});

	it("should report error when refresh has empty url", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <meta http-equiv="refresh" content="0;url=" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Don't use instant meta refresh to reload the page (meta-refresh) at inline:1:38:
			> 1 |  <meta http-equiv="refresh" content="0;url=" />
			    |                                      ^^^^^^
			Selector: meta"
		`);
	});

	it("should report error when refresh is malformed", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <meta http-equiv="refresh" content="foobar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Malformed meta refresh directive (meta-refresh) at inline:1:38:
			> 1 |  <meta http-equiv="refresh" content="foobar" />
			    |                                      ^^^^^^
			Selector: meta"
		`);
	});

	describe("with allowLongDelay option", () => {
		beforeEach(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "meta-refresh": ["error", { allowLongDelay: true }] },
			});
		});

		it("should not report error when refresh has more than 20h delay without url", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="72001" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when refresh has more than 20h delay with url", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="72001;url=target.html" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when refresh has non-zero delay less than 20h", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="1;url=target.html" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Meta refresh must be instant (0 second delay) or greater than 20 hours (72000 second delay) (meta-refresh) at inline:1:38:
				> 1 |  <meta http-equiv="refresh" content="1;url=target.html" />
				    |                                      ^^^^^^^^^^^^^^^^^
				Selector: meta"
			`);
		});

		it("should report error when refresh has non-zero delay less than 20h (with whitespace)", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="1; url=target.html" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Meta refresh must be instant (0 second delay) or greater than 20 hours (72000 second delay) (meta-refresh) at inline:1:38:
				> 1 |  <meta http-equiv="refresh" content="1; url=target.html" />
				    |                                      ^^^^^^^^^^^^^^^^^^
				Selector: meta"
			`);
		});

		it("should report error when refresh has exactly 20h delay", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="72000;url=target.html" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Meta refresh must be instant (0 second delay) or greater than 20 hours (72000 second delay) (meta-refresh) at inline:1:38:
				> 1 |  <meta http-equiv="refresh" content="72000;url=target.html" />
				    |                                      ^^^^^^^^^^^^^^^^^^^^^
				Selector: meta"
			`);
		});
	});

	describe("without allowLongDelay option", () => {
		beforeEach(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "meta-refresh": ["error", { allowLongDelay: false }] },
			});
		});

		it("should report error when refresh has more than 20h delay without url", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="72001" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Meta refresh must be instant (0 second delay) (meta-refresh) at inline:1:38:
				> 1 |  <meta http-equiv="refresh" content="72001" />
				    |                                      ^^^^^
				Selector: meta"
			`);
		});

		it("should report error when refresh has more than 20h delay with url", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="72001;url=target.html" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Meta refresh must be instant (0 second delay) (meta-refresh) at inline:1:38:
				> 1 |  <meta http-equiv="refresh" content="72001;url=target.html" />
				    |                                      ^^^^^^^^^^^^^^^^^^^^^
				Selector: meta"
			`);
		});

		it("should report error when refresh has non-zero delay less than 20h", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="1;url=target.html" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Meta refresh must be instant (0 second delay) (meta-refresh) at inline:1:38:
				> 1 |  <meta http-equiv="refresh" content="1;url=target.html" />
				    |                                      ^^^^^^^^^^^^^^^^^
				Selector: meta"
			`);
		});

		it("should report error when refresh has non-zero delay less than 20h (with whitespace)", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="1; url=target.html" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Meta refresh must be instant (0 second delay) (meta-refresh) at inline:1:38:
				> 1 |  <meta http-equiv="refresh" content="1; url=target.html" />
				    |                                      ^^^^^^^^^^^^^^^^^^
				Selector: meta"
			`);
		});

		it("should report error when refresh has exactly 20h delay", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <meta http-equiv="refresh" content="72000;url=target.html" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Meta refresh must be instant (0 second delay) (meta-refresh) at inline:1:38:
				> 1 |  <meta http-equiv="refresh" content="72000;url=target.html" />
				    |                                      ^^^^^^^^^^^^^^^^^^^^^
				Selector: meta"
			`);
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("meta-refresh");
		expect(docs).toMatchSnapshot();
	});
});
