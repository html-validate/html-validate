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
				const report = await htmlvalidate.validateString("<p>lorem ipsum</p>");
				expect(report).toBeValid();
			});

			it("should not report error when text has htmlentities", async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString("<p>lorem &amp; ipsum</p>");
				expect(report).toBeValid();
			});

			it("should not report error when CDATA has raw special characters", async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString("<p><![CDATA[&]]></p>");
				expect(report).toBeValid();
			});

			it("should report error when raw special characters are present", async () => {
				expect.assertions(2);
				const report = await htmlvalidate.validateString(`<p> < & > </p>`);
				expect(report).toBeInvalid();
				expect(report).toHaveErrors([
					["no-raw-characters", 'Raw "<" must be encoded as "&lt;"'],
					["no-raw-characters", 'Raw "&" must be encoded as "&amp;"'],
					["no-raw-characters", 'Raw ">" must be encoded as "&gt;"'],
				]);
			});

			it("should report error once when children has raw special characters", async () => {
				expect.assertions(2);
				const report = await htmlvalidate.validateString("<p><i>&</i></p> ");
				expect(report).toBeInvalid();
				expect(report).toHaveErrors([["no-raw-characters", 'Raw "&" must be encoded as "&amp;"']]);
			});
		});

		describe("unquoted attributes", () => {
			it("should not report error when attribute has no special characters", async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString("<p class=foo></p>");
				expect(report).toBeValid();
			});

			it("should not report error when attribute has htmlentities", async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString("<p class=foo&apos;s></p>");
				expect(report).toBeValid();
			});

			it("should not report error for boolean attributes", async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString("<input disabled>");
				expect(report).toBeValid();
			});

			it('should report error when " are present', async () => {
				expect.assertions(2);
				const report = await htmlvalidate.validateString('<p class=foo"s></p>');
				expect(report).toBeInvalid();
				expect(report).toHaveErrors([["no-raw-characters", `Raw """ must be encoded as "&quot;"`]]);
			});

			it("should report error when ' are present", async () => {
				expect.assertions(2);
				const report = await htmlvalidate.validateString("<p class=foo's></p>");
				expect(report).toBeInvalid();
				expect(report).toHaveErrors([["no-raw-characters", `Raw "'" must be encoded as "&apos;"`]]);
			});

			it("should report error when = are present", async () => {
				expect.assertions(2);
				const report = await htmlvalidate.validateString("<p class=foo=s></p>");
				expect(report).toBeInvalid();
				expect(report).toHaveErrors([
					["no-raw-characters", `Raw "=" must be encoded as "&equals;"`],
				]);
			});

			it("should report error when ` are present", async () => {
				expect.assertions(2);
				const report = await htmlvalidate.validateString("<p class=foo`s></p>");
				expect(report).toBeInvalid();
				expect(report).toHaveErrors([
					["no-raw-characters", 'Raw "`" must be encoded as "&grave;"'],
				]);
			});
		});

		describe("quoted attributes", () => {
			it("should not report error when & are present", async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString('<p class="foo&s"></p>');
				expect(report).toBeValid();
			});
			it(`should not report error when " are present in value quoted by '`, async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString(`<p class="'"></p>`);
				expect(report).toBeValid();
			});
			it(`should not report error when ' are present in value quoted by "`, async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString(`<p class='"'></p>`);
				expect(report).toBeValid();
			});
			it(`should not report error when = are present`, async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString(`<p class='='></p>`);
				expect(report).toBeValid();
			});
			it("should not report error when ` are present", async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString('<p class="`"></p>');
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
				const report = await htmlvalidate.validateString(`<p>lorem ${input} ipsum</p>`);
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
			const report = await htmlvalidate.validateString("<p>lorem & ipsum&dolor &amp; &sit;</p>");
			expect(report).toBeValid();
		});

		it("should not report error when ampersand in attribute isn't ambiguous", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString('<a href="?foo=1&bar=2&baz&spam"></a>');
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
