import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-raw-characters", () => {
	let htmlvalidate: HtmlValidate;

	describe("default options", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-raw-characters": "error" },
			});
		});

		describe("text content", () => {
			it("should not report error when text has no special characters", async () => {
				expect.assertions(1);
				const markup = /* HTML */ ` <p>lorem ipsum</p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it("should not report error when text has htmlentities", async () => {
				expect.assertions(1);
				const markup = /* HTML */ ` <p>lorem &amp; ipsum</p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it("should not report error when CDATA has raw special characters", async () => {
				expect.assertions(1);
				const markup = /* HTML */ ` <p><![CDATA[&]]></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it("should report error when raw special characters are present", async () => {
				expect.assertions(2);
				const markup = /* HTML */ ` <p>< & ></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: Raw "<" must be encoded as "&lt;" (no-raw-characters) at inline:1:5:
					> 1 |  <p>< & ></p>
					    |     ^
					Selector: p
					error: Raw "&" must be encoded as "&amp;" (no-raw-characters) at inline:1:7:
					> 1 |  <p>< & ></p>
					    |       ^
					Selector: p
					error: Raw ">" must be encoded as "&gt;" (no-raw-characters) at inline:1:9:
					> 1 |  <p>< & ></p>
					    |         ^
					Selector: p"
				`);
			});

			it("should report error once when children has raw special characters", async () => {
				expect.assertions(2);
				const markup = /* HTML */ ` <p><i>&</i></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: Raw "&" must be encoded as "&amp;" (no-raw-characters) at inline:1:8:
					> 1 |  <p><i>&</i></p>
					    |        ^
					Selector: p > i"
				`);
			});
		});

		describe("unquoted attributes", () => {
			it("should not report error when attribute has no special characters", async () => {
				expect.assertions(1);
				const markup = /* RAW */ ` <p class=foo></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it("should not report error when attribute has htmlentities", async () => {
				expect.assertions(1);
				const markup = /* RAW */ ` <p class=foo&apos;s></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it("should not report error for boolean attributes", async () => {
				expect.assertions(1);
				const markup = /* HTML */ ` <input disabled /> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it('should report error when " are present', async () => {
				expect.assertions(2);
				const markup = /* RAW */ ` <p class=foo"s></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: Raw """ must be encoded as "&quot;" (no-raw-characters) at inline:1:14:
					> 1 |  <p class=foo"s></p>
					    |              ^
					Selector: p"
				`);
			});

			it("should report error when ' are present", async () => {
				expect.assertions(2);
				const markup = /* RAW */ ` <p class=foo's></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: Raw "'" must be encoded as "&apos;" (no-raw-characters) at inline:1:14:
					> 1 |  <p class=foo's></p>
					    |              ^
					Selector: p"
				`);
			});

			it("should report error when = are present", async () => {
				expect.assertions(2);
				const markup = /* RAW */ ` <p class=foo=s></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: Raw "=" must be encoded as "&equals;" (no-raw-characters) at inline:1:14:
					> 1 |  <p class=foo=s></p>
					    |              ^
					Selector: p"
				`);
			});

			it("should report error when ` are present", async () => {
				expect.assertions(2);
				const markup = /* RAW */ ` <p class=foo\`s></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: Raw "\`" must be encoded as "&grave;" (no-raw-characters) at inline:1:14:
					> 1 |  <p class=foo\`s></p>
					    |              ^
					Selector: p"
				`);
			});
		});

		describe("quoted attributes", () => {
			it("should not report error when & are present", async () => {
				expect.assertions(1);
				const markup = /* HTML */ ` <p class="foo&s"></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it(`should not report error when " are present in value quoted by '`, async () => {
				expect.assertions(1);
				const markup = /* HTML */ ` <p class="'"></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it(`should not report error when ' are present in value quoted by "`, async () => {
				expect.assertions(1);
				const markup = /* HTML */ ` <p class='"'></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it(`should not report error when = are present`, async () => {
				expect.assertions(1);
				const markup = /* HTML */ ` <p class="="></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it("should not report error when ` are present", async () => {
				expect.assertions(1);
				const markup = /* HTML */ ` <p class="\`"></p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});
		});

		describe("should not report templating", () => {
			it.each`
				input          | description
				${"<% & %>"}   | ${"<% & %>"}
				${"<%\n&\n%>"} | ${"<% & %> (with newlines)"}
				${"<? & ?>"}   | ${"<? & ?>"}
				${"<?\n&\n?>"} | ${"<? & ?> (with newlines)"}
				${"<$ & $>"}   | ${"<$ & $>"}
				${"<$\n&\n$>"} | ${"<$ & $> (with newlines)"}
			`("$description", async ({ input }) => {
				expect.assertions(1);
				const markup = /* HTML */ ` <p>lorem ${input} ipsum</p> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/no-raw-characters.html");
			expect(report).toMatchCodeframe();
		});
	});

	describe("relaxed", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-raw-characters": ["error", { relaxed: true }] },
			});
		});

		it("should not report error when ampersand in text isn't ambiguous", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p>lorem & ipsum&dolor &amp; &sit;</p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when ampersand in attribute isn't ambiguous", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a href="?foo=1&bar=2&baz&spam"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/no-raw-characters.html");
			expect(report).toMatchCodeframe();
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-raw-characters": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("no-raw-characters");
		expect(docs).toMatchSnapshot();
	});
});
