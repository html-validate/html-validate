import HtmlValidate from "../htmlvalidate";
import "../matchers";

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

	it("should not report when regular element is used", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<p></p>");
		expect(report).toBeValid();
	});

	it("should not report when unknown element is used", () => {
		expect.assertions(1);
		const markup = "<missing-meta></missing-meta>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for ignored deprecated elements", () => {
		expect.assertions(1);
		const markup = "<applet></applet>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when deprecated element is used", () => {
		expect.assertions(2);
		const markup = "<marquee>foobar</marquee>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("deprecated", "<marquee> is deprecated");
	});

	it("should report error when element with deprecation message is used", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<custom-deprecated>foobar</custom-deprecated>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("deprecated", "<custom-deprecated> is deprecated: lorem ipsum");
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/deprecated.html");
		expect(report.results).toMatchSnapshot();
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
		`("$description", ({ deprecated, message, documentation }) => {
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
			const report = htmlvalidate.validateString("<my-element></my-element>");
			expect(report).toHaveError("deprecated", message);
			const context = report.results[0].messages[0].context;
			const doc = htmlvalidate.getRuleDocumentation("deprecated", null, context);
			expect(doc?.description).toEqual(documentation);
		});
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("deprecated")).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(4);
		expect(
			htmlvalidate.getRuleDocumentation("deprecated", null, {
				tagName: "center",
			})
		).toMatchSnapshot();
		expect(
			htmlvalidate.getRuleDocumentation("deprecated", null, {
				tagName: "blink",
				source: "html5",
			})
		).toMatchSnapshot();
		expect(
			htmlvalidate.getRuleDocumentation("deprecated", null, {
				tagName: "blink",
				source: "html41",
			})
		).toMatchSnapshot();
		expect(
			htmlvalidate.getRuleDocumentation("deprecated", null, {
				tagName: "blink",
				documentation: "extra documentation for <$tagname>",
			})
		).toMatchSnapshot();
	});
});
