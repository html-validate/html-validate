import { Source } from "../context";
import { HtmlElement } from "../dom";
import HtmlValidate from "../htmlvalidate";
import "../jest";
import metadata from "./html5";

const fileDirectory = "test-files/elements";
const tagNames = Object.keys(metadata).filter((it) => it !== "*");

describe("HTML elements", () => {
	const htmlvalidate = new HtmlValidate({
		root: true,
		extends: ["html-validate:recommended"],
		elements: [
			"html5",
			{
				"custom-form": {
					inherit: "form",
				},
			},
		],
		rules: {
			/* allow any style of boolean/empty attributes, some tests runs all of them */
			"attribute-boolean-style": "off",
			"attribute-empty-style": "off",

			/* messes with tests validating that elements with support implicit close
			 * does so */
			"no-implicit-close": "off",

			/* while <button> is preferred the <input type="button"> tests should not
			 * yield any errors */
			"prefer-button": "off",

			/* disabled by default, should be included in these tests */
			"svg-focusable": "error",

			/* void is being deprecated */
			void: "off",

			/* none of the WCAG rules should trigger in these tests, they are tested
			 * separately and adds too much noise here */
			"wcag/h32": "off",
			"wcag/h37": "off",
			"wcag/h63": "off",
			"wcag/h67": "off",

			/* svg elements uses a remapping of tagnames (added namespace), this
			 * ensures this mapping works as inteded */
			"no-unknown-elements": "error",
		},
	});

	function getElement(markup: string, selector: string): HtmlElement | null {
		const source: Source = {
			data: markup,
			filename: "inline",
			line: 1,
			column: 1,
			offset: 0,
		};
		const parser = htmlvalidate.getParserFor(source);
		const doc = parser.parseHtml(source.data);
		return doc.querySelector(selector);
	}

	describe("<input>", () => {
		it("should be labelable unless hidden", () => {
			expect.assertions(1);
			const markup = '<input type="text">';
			const input = getElement(markup, "input")!;
			const meta = input.meta;
			expect(meta?.labelable).toBeTruthy();
		});

		it("should not be labelable if hidden", () => {
			expect.assertions(1);
			const markup = '<input type="hidden">';
			const input = getElement(markup, "input")!;
			const meta = input.meta;
			expect(meta?.labelable).toBeFalsy();
		});
	});

	describe(`global attributes`, () => {
		it("valid markup", () => {
			expect.assertions(1);
			const filename = `${fileDirectory}/global-attributes-valid.html`;
			const report = htmlvalidate.validateFile(filename);
			expect(report.results).toMatchSnapshot();
		});

		it("invalid markup", () => {
			expect.assertions(1);
			const filename = `${fileDirectory}/global-attributes-invalid.html`;
			const report = htmlvalidate.validateFile(filename);
			expect(report.results).toMatchSnapshot();
		});
	});

	for (const tagName of tagNames) {
		const slug = tagName.replace(":", "_");
		const filename = (variant: string): string => `${fileDirectory}/${slug}-${variant}.html`;

		describe(`<${tagName}>`, () => {
			it("valid markup", () => {
				expect.assertions(1);
				const report = htmlvalidate.validateFile(filename("valid"));
				expect(report.results).toMatchSnapshot();
			});

			it("invalid markup", () => {
				expect.assertions(1);
				const report = htmlvalidate.validateFile(filename("invalid"));
				expect(report.results).toMatchSnapshot();
			});
		});
	}
});
