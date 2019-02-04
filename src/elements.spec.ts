import HtmlValidate from "./htmlvalidate";
import "./matchers";

function getElementMarkup(
	tagName: string,
	variant: string,
	attr: { [key: string]: string } = {}
) {
	const attrString = Object.entries(attr).reduce((str, [key, value]) => {
		if (value !== undefined) {
			return `${str} ${key}="${value}"`;
		} else {
			return `${str} ${key}`;
		}
	}, "");
	switch (variant) {
		case "omit":
			return `<${tagName}${attrString}>`;
		case "void":
			return `<${tagName}${attrString}/>`;
		default:
			return `<${tagName}${attrString}>foo</${tagName}>`;
	}
}

describe("HTML elements", () => {
	const htmlvalidate = new HtmlValidate({
		rules: {
			deprecated: "error",
			"attribute-allowed-values": "error",
			"element-permitted-content": "error",
			"element-permitted-occurrences": "error",
			"element-permitted-order": "error",
			void: ["error", { style: "any" }],
		},
	});

	function allowAttribute(
		tagName: string,
		attr: string,
		values: string[],
		variant?: string
	) {
		if (values.length === 0) {
			it(`should allow boolean attribute ${attr}`, () => {
				const markup = getElementMarkup(tagName, variant, {
					[attr]: undefined,
				});
				const report = htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});
		}
		for (const value of values) {
			it(`should allow attribute ${attr}="${value}"`, () => {
				const markup = getElementMarkup(tagName, variant, { [attr]: value });
				const report = htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});
		}
	}

	function disallowAttribute(
		tagName: string,
		attr: string,
		values: string[],
		variant?: string
	) {
		for (const value of values) {
			it(`should disallow attribute ${attr}="${value}"`, () => {
				const markup = getElementMarkup(tagName, variant, { [attr]: value });
				const report = htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
			});
		}
	}

	function deprecated(tagName: string) {
		it("should report as deprecated", () => {
			const report = htmlvalidate.validateString(`<${tagName}></${tagName}>`);
			expect(report.valid).toBeFalsy();
			expect(report.results[0].messages[0].ruleId).toEqual("deprecated");
		});
	}

	const tagNames = [
		"a",
		"abbr",
		"acronym",
		"address",
		"applet",
		"area",
		"article",
		"aside",
		"audio",
		"b",
		"base",
		"basefont",
		"bdi",
		"bdo",
		"bgsound",
		"big",
		"blink",
		"blockquote",
		"body",
		"br",
		"button",
		"canvas",
		"caption",
		"center",
		"cite",
		"code",
		"col",
		"colgroup",
		"data",
		"datalist",
		"dd",
		"del",
		"dfn",
		"dir",
		"div",
		"dl",
		"dt",
		"em",
		"embed",
		"fieldset",
		"figcaption",
		"figure",
		"font",
		"footer",
		"form",
		"frame",
		"frameset",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"head",
		"header",
		"hgroup",
		"hr",
		"html",
		"i",
		"iframe",
		"img",
		"input",
		"ins",
		"isindex",
		"kbd",
		"keygen",
		"label",
		"legend",
		"li",
		"link",
		"listing",
		"main",
		"map",
		"mark",
		"marquee",
		"math",
		"meta",
		"meter",
		"multicol",
		"nav",
		"nextid",
		"nobr",
		"noembed",
		"noframes",
		"noscript",
		"object",
		"ol",
		"optgroup",
		"option",
		"output",
		"p",
		"param",
		"plaintext",
		"pre",
		"progress",
		"q",
		"rb",
		"rp",
		"rt",
		"rtc",
		"ruby",
		"s",
		"samp",
		"script",
		"section",
		"select",
		"small",
		"source",
		"spacer",
		"span",
		"strike",
		"strong",
		"style",
		"sub",
		"sup",
		"svg",
		"table",
		"tbody",
		"td",
		"textarea",
		"tfoot",
		"th",
		"thead",
		"time",
		"title",
		"tr",
		"track",
		"tt",
		"u",
		"ul",
		"var",
		"video",
		"wbr",
	];

	for (const tagName of tagNames) {
		const dir = "test-files/elements";
		const filename = (variant: string) => `${dir}/${tagName}-${variant}.html`;

		describe(`<${tagName}>`, () => {
			it("valid markup", () => {
				const report = htmlvalidate.validateFile(filename("valid"));
				expect(report.results).toMatchSnapshot();
			});

			it("invalid markup", () => {
				const report = htmlvalidate.validateFile(filename("invalid"));
				expect(report.results).toMatchSnapshot();
			});
		});
	}

	describe("global attributes", () => {
		allowAttribute("input", "contenteditable", ["", "true", "false"], "omit");
		allowAttribute("input", "dir", ["ltr", "rtl", "auto"], "omit");
		allowAttribute("input", "draggable", ["true", "false"], "omit");
		allowAttribute("input", "hidden", [], "omit");
		allowAttribute("input", "hidden", ["", "hidden"], "omit");
		allowAttribute("input", "tabindex", ["0", "12", "-1"], "omit");
		disallowAttribute("input", "contenteditable", ["foobar"], "omit");
		disallowAttribute("input", "dir", ["", "foobar"], "omit");
		disallowAttribute("input", "draggable", ["", "foobar"], "omit");
		disallowAttribute("input", "hidden", ["foobar"], "omit");
		disallowAttribute("input", "tabindex", ["", "foobar"], "omit");
	});

	describe("<xmp>", () => {
		deprecated("xmp");
	});
});
