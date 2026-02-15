import { type Source } from "../context";
import { type HtmlElement } from "../dom";
import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { type Parser } from "../parser";
import metadata from "./html5";

const fileDirectory = "test-files/elements";
const tagNames = Object.keys(metadata).filter((it) => it !== "*");

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
		/* not really relevant for testing HTML5, the rule has specific tests */
		"autocomplete-password": "off",

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

		/* triggers on all landmark tests and is tedious/noise to add to all of
		 * them, there are separate tests for this rule to verify it functions */
		"unique-landmark": "off",

		/* none of the WCAG rules should trigger in these tests, they are tested
		 * separately and adds too much noise here */
		"wcag/h32": "off",
		"wcag/h37": "off",
		"wcag/h63": "off",
		"wcag/h67": "off",

		/* svg elements uses a remapping of tagnames (added namespace), this ensures
		 * this mapping works as intended */
		"no-unknown-elements": "error",
	},
});

const source: Source = {
	data: "",
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
};

let parser: Parser;

beforeAll(async () => {
	parser = await htmlvalidate.getParserFor(source);
});

describe("HTML elements", () => {
	function getElement(markup: string, selector: string): HtmlElement {
		const doc = parser.parseHtml(markup);
		return doc.querySelector(selector)!;
	}

	describe("<a>", () => {
		it("should be focusable if href is present", () => {
			expect.assertions(1);
			const markup = "<a href></a>";
			const input = getElement(markup, "a");
			const meta = input.meta;
			expect(meta?.focusable).toBe(true);
		});

		it("should not be focusable unless href is present", () => {
			expect.assertions(1);
			const markup = "<a></a>";
			const input = getElement(markup, "a");
			const meta = input.meta;
			expect(meta?.focusable).toBe(false);
		});
	});

	describe("<area>", () => {
		it("should be focusable if href is present", () => {
			expect.assertions(1);
			const markup = "<area href></area>";
			const input = getElement(markup, "area");
			const meta = input.meta;
			expect(meta?.focusable).toBe(true);
		});

		it("should not be focusable unless href is present", () => {
			expect.assertions(1);
			const markup = "<area></area>";
			const input = getElement(markup, "area");
			const meta = input.meta;
			expect(meta?.focusable).toBe(false);
		});
	});

	describe("<audio>", () => {
		it("should be focusable if controls is present", () => {
			expect.assertions(1);
			const markup = "<audio controls></audio>";
			const input = getElement(markup, "audio");
			const meta = input.meta;
			expect(meta?.focusable).toBe(true);
		});

		it("should not be focusable unless controls is present", () => {
			expect.assertions(1);
			const markup = "<audio></audio>";
			const input = getElement(markup, "audio");
			const meta = input.meta;
			expect(meta?.focusable).toBe(false);
		});
	});

	describe("<input>", () => {
		it("should be focusable unless hidden", () => {
			expect.assertions(1);
			const markup = '<input type="text">';
			const input = getElement(markup, "input");
			const meta = input.meta;
			expect(meta?.focusable).toBe(true);
		});

		it("should be labelable unless hidden", () => {
			expect.assertions(1);
			const markup = '<input type="text">';
			const input = getElement(markup, "input");
			const meta = input.meta;
			expect(meta?.labelable).toBe(true);
		});

		it("should not be focusable if hidden", () => {
			expect.assertions(1);
			const markup = '<input type="hidden">';
			const input = getElement(markup, "input");
			const meta = input.meta;
			expect(meta?.focusable).toBe(false);
		});

		it("should not be labelable if hidden", () => {
			expect.assertions(1);
			const markup = '<input type="hidden">';
			const input = getElement(markup, "input");
			const meta = input.meta;
			expect(meta?.labelable).toBe(false);
		});
	});

	describe("<video>", () => {
		it("should be focusable if controls is present", () => {
			expect.assertions(1);
			const markup = "<video controls></video>";
			const input = getElement(markup, "video");
			const meta = input.meta;
			expect(meta?.focusable).toBe(true);
		});

		it("should not be focusable unless controls is present", () => {
			expect.assertions(1);
			const markup = "<video></video>";
			const input = getElement(markup, "video");
			const meta = input.meta;
			expect(meta?.focusable).toBe(false);
		});
	});

	describe(`global attributes`, () => {
		it("valid markup", async () => {
			expect.assertions(1);
			const filename = `${fileDirectory}/global-attributes-valid.html`;
			const report = await htmlvalidate.validateFile(filename);
			expect(report.results).toMatchSnapshot();
		});

		it("invalid markup", async () => {
			expect.assertions(1);
			const filename = `${fileDirectory}/global-attributes-invalid.html`;
			const report = await htmlvalidate.validateFile(filename);
			expect(report.results).toMatchSnapshot();
		});
	});

	for (const tagName of tagNames) {
		const slug = tagName.replace(":", "_");
		const filename = (variant: string): string => `${fileDirectory}/${slug}-${variant}.html`;

		describe(`<${tagName}>`, () => {
			it("valid markup", async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateFile(filename("valid"));
				expect(report.results).toMatchSnapshot();
			});

			it("invalid markup", async () => {
				expect.assertions(1);
				const report = await htmlvalidate.validateFile(filename("invalid"));
				expect(report.results).toMatchSnapshot();
			});
		});
	}
});
