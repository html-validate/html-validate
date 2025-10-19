import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule deprecated", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { deprecated: ["error", { exclude: ["applet"] }] },
			elements: [
				"html5",
				{
					"custom-deprecated": {
						deprecated: "lorem ipsum",
					},
				},
			],
		});
	});

	it("should not report when regular element is used", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when unknown element is used", async () => {
		expect.assertions(1);
		const markup = "<missing-meta></missing-meta>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for ignored deprecated elements", async () => {
		expect.assertions(1);
		const markup = "<applet></applet>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when deprecated element is used", async () => {
		expect.assertions(2);
		const markup = "<marquee>foobar</marquee>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("deprecated", "<marquee> is deprecated");
	});

	it("should report error when element with deprecation message is used", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <custom-deprecated> foobar </custom-deprecated> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("deprecated", "<custom-deprecated> is deprecated: lorem ipsum");
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/deprecated.html");
		expect(report).toMatchInlineCodeframe(`
			"error: <marquee> is deprecated (deprecated) at test-files/rules/deprecated.html:2:2:
			  1 | <p>lorem ipsum</p>
			> 2 | <marquee>foobar</marquee>
			    |  ^^^^^^^
			  3 |
			Selector: marquee"
		`);
	});

	describe("metadata variants", () => {
		it.each`
			description              | deprecated                           | message                                      | documentation
			${"boolean"}             | ${true}                              | ${"<my-element> is deprecated"}              | ${"The `<my-element>` element is deprecated and should not be used in new code."}
			${"string"}              | ${"lorem ipsum"}                     | ${"<my-element> is deprecated: lorem ipsum"} | ${"The `<my-element>` element is deprecated and should not be used in new code."}
			${"message"}             | ${{ message: "lorem ipsum" }}        | ${"<my-element> is deprecated: lorem ipsum"} | ${"The `<my-element>` element is deprecated and should not be used in new code."}
			${"documentation"}       | ${{ documentation: "Lorem ipsum." }} | ${"<my-element> is deprecated"}              | ${"The `<my-element>` element is deprecated and should not be used in new code.\n\nLorem ipsum."}
			${"source html5"}        | ${{ source: "html5" }}               | ${"<my-element> is deprecated"}              | ${"The `<my-element>` element is deprecated in HTML 5 and should not be used in new code."}
			${"source html53"}       | ${{ source: "html53" }}              | ${"<my-element> is deprecated"}              | ${"The `<my-element>` element is deprecated in HTML 5.3 and should not be used in new code."}
			${"source whatwg"}       | ${{ source: "whatwg" }}              | ${"<my-element> is deprecated"}              | ${"The `<my-element>` element is deprecated in HTML Living Standard and should not be used in new code."}
			${"source non-standard"} | ${{ source: "non-standard" }}        | ${"<my-element> is deprecated"}              | ${"The `<my-element>` element is deprecated and non-standard and should not be used in new code."}
			${"source lib"}          | ${{ source: "my-lib" }}              | ${"<my-element> is deprecated"}              | ${"The `<my-element>` element is deprecated by my-lib and should not be used in new code."}
		`(
			"$description",
			async ({
				deprecated,
				message,
				documentation,
			}: {
				deprecated: unknown;
				message: string;
				documentation: string;
			}) => {
				expect.assertions(2);
				const htmlvalidate = new HtmlValidate({
					rules: { deprecated: "error" },
					elements: [
						"html5",
						{
							"my-element": {
								deprecated,
							},
						},
					],
				});
				const markup = /* HTML */ ` <my-element></my-element> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toHaveError("deprecated", message);
				const context = report.results[0].messages[0].context;
				/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
				const doc = await htmlvalidate.getRuleDocumentation("deprecated", null, context);
				expect(doc?.description).toEqual(documentation);
			},
		);
	});

	it("should contain documentation", async () => {
		expect.assertions(4);
		expect(
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			await htmlvalidate.getRuleDocumentation("deprecated", null, {
				tagName: "center",
			}),
		).toMatchSnapshot();
		expect(
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			await htmlvalidate.getRuleDocumentation("deprecated", null, {
				tagName: "blink",
				source: "html5",
			}),
		).toMatchSnapshot();
		expect(
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			await htmlvalidate.getRuleDocumentation("deprecated", null, {
				tagName: "blink",
				source: "html41",
			}),
		).toMatchSnapshot();
		expect(
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			await htmlvalidate.getRuleDocumentation("deprecated", null, {
				tagName: "blink",
				documentation: "extra documentation for <$tagname>",
			}),
		).toMatchSnapshot();
	});
});
