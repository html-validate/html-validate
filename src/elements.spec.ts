import HtmlValidate from "./htmlvalidate";
import "./matchers";

type ContentCategory =
	| "@embedded"
	| "@flow"
	| "@heading"
	| "@interactive"
	| "@metadata"
	| "@phrasing"
	| "@sectioning";

const contentCategory = {
	"@embedded": "audio",
	"@flow": "div",
	"@heading": "h1",
	"@interactive": "button",
	"@metadata": "style",
	"@phrasing": "span",
	"@sectioning": "article",
};

function inlineSource(source: string) {
	return {
		data: source,
		filename: "inline",
		line: 1,
		column: 1,
	};
}

function getTagname(category: ContentCategory | string) {
	if (category[0] === "@") {
		return contentCategory[category as ContentCategory];
	} else {
		return category;
	}
}

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

	function allow(markup: string, comment: string) {
		it(`should allow ${comment}`, () => {
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	}

	function allowContent(tagName: string, category: string, variant?: string) {
		const child = getTagname(category);
		const pretty = category[0] === "@" ? category : `<${category}>`;
		const inner = getElementMarkup(child, variant);
		it(`should allow ${pretty} as content`, () => {
			const markup = `<${tagName}>${inner}</${tagName}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	}

	function allowParent(tagName: string, category: string, variant?: string) {
		const outer = getTagname(category);
		const inner = getElementMarkup(tagName, variant);
		it(`should allow <${outer}> as parent`, () => {
			const markup = `<${outer}>${inner}</${outer}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	}

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

	function disallow(markup: string, comment: string) {
		it(`should not allow ${comment}`, () => {
			const report = htmlvalidate.validateString(markup);
			expect(report.valid).toBeFalsy();
		});
	}

	function disallowContent(tagName: string, category: string) {
		const child = getTagname(category);
		const pretty = category[0] === "@" ? category : `<${category}>`;
		it(`should disallow ${pretty} as content`, () => {
			const markup = `<${tagName}><${child}>foo</${child}></${tagName}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report.valid).toBeFalsy();
		});
	}

	function disallowDescendant(tagName: string, category: string) {
		const child = getTagname(category);
		const pretty = category[0] === "@" ? category : `<${category}>`;
		it(`should disallow ${pretty} as descendant`, () => {
			const markup = `<${tagName}><span><${child}>foo</${child}></span></${tagName}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report.valid).toBeFalsy();
		});
	}

	function disallowNesting(tagName: string) {
		disallowContent(tagName, tagName);
	}

	function disallowParent(tagName: string, category: string, variant?: string) {
		const outer = getTagname(category);
		const inner = getElementMarkup(tagName, variant);
		it(`should disallow <${outer}> as parent`, () => {
			const markup = `<${outer}>${inner}</${outer}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report.valid).toBeFalsy();
		});
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

	function omitEnd(tagName: string) {
		it("should allow omitted end tag", () => {
			const markup = `<${tagName}/>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	}

	function defaultTextLevel(tagName: string) {
		allowContent(tagName, "@phrasing");
		allowParent(tagName, "div");
		allowParent(tagName, "span");
		disallowContent(tagName, "@flow");
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

	describe("<basefont>", () => {
		deprecated("basefont");
	});

	describe("<bdi>", () => {
		defaultTextLevel("bdi");
	});

	describe("<bdo>", () => {
		defaultTextLevel("bdo");
	});

	describe("<bgsound>", () => {
		deprecated("bgsound");
	});

	describe("<big>", () => {
		deprecated("big");
	});

	describe("<blink>", () => {
		deprecated("blink");
	});

	describe("<blockquote>", () => {
		allowContent("blockquote", "@flow");
		allowParent("blockquote", "div");
	});

	describe("<body>", () => {
		allowParent("body", "html");
		disallowParent("body", "div");
	});

	describe("<br>", () => {
		omitEnd("br");
		allowParent("br", "span", "void");
		allowParent("br", "div", "void");
	});

	describe("<button>", () => {
		allowContent("button", "@phrasing");
		allowParent("button", "span");
		allowParent("button", "div");
		disallowContent("button", "@flow");
		disallowDescendant("button", "@interactive");
		disallowNesting("button");
		allowAttribute("button", "autofocus", []);
		allowAttribute("button", "disabled", []);
		allowAttribute("button", "type", ["submit", "reset", "button"]);
		disallowAttribute("button", "type", ["", "foobar"]);
	});

	describe("<canvas>", () => {
		allowContent("canvas", "@flow");
		allowParent("canvas", "div");
	});

	describe("<caption>", () => {
		allowContent("caption", "@flow");
		allowParent("caption", "table");
		disallowDescendant("caption", "table");
		disallowParent("caption", "div");
	});

	describe("<center>", () => {
		deprecated("center");
	});

	describe("<cite>", () => {
		defaultTextLevel("cite");
	});

	describe("<code>", () => {
		defaultTextLevel("code");
	});

	describe("<col>", () => {
		omitEnd("col");
		allowParent("col", "colgroup", "void");
		disallowParent("col", "div", "void");
	});

	describe("<colgroup>", () => {
		allowParent("colgroup", "table");
		disallowParent("colgroup", "div");
		allow("<colgroup><col/></colgroup>", "<col> as content");
		allowContent("colgroup", "template");
		disallowContent("colgroup", "span");
	});

	describe("<data>", () => {
		defaultTextLevel("data");
	});

	describe("<datalist>", () => {
		defaultTextLevel("datalist");
		allowContent("datalist", "option");
	});

	describe("<dd>", () => {
		allowParent("dd", "dl");
		disallowParent("dd", "div");
		allowContent("dd", "@flow");
	});

	describe("<del>", () => {
		allow(
			"<span><del><span>foo</span></del></span>",
			"phrasing in phrasing context"
		);
		allow("<div><del><div>foo</div></del></div>", "flow in flow context");
		disallow(
			"<span><del><div>foo</div></del></span>",
			"flow in phrasing context"
		);
	});

	describe("<dfn>", () => {
		defaultTextLevel("dfn");
		disallowDescendant("dfn", "dfn");
	});

	describe("<dir>", () => {
		deprecated("dir");
	});

	describe("<div>", () => {
		allowContent("div", "@flow");
		allowParent("div", "body");
	});

	describe("<dl>", () => {
		allowParent("dl", "@flow");
		allowContent("dl", "dt");
		allowContent("dl", "dd");
		allowContent("dl", "script");
		allowContent("dl", "template");
	});

	describe("<dt>", () => {
		allowParent("dt", "dl");
		allowContent("dt", "@flow");
		disallowDescendant("dt", "header");
		disallowDescendant("dt", "footer");
		disallowDescendant("dt", "@sectioning");
		disallowDescendant("dt", "@heading");
	});

	describe("<em>", () => {
		defaultTextLevel("em");
	});

	describe("<embed>", () => {
		omitEnd("embed");
		allowParent("embed", "@flow", "void");
		allowParent("embed", "@phrasing", "void");
	});

	describe("<fieldset>", () => {
		allowParent("fieldset", "@flow");
		allowContent("fieldset", "@flow");
		allowContent("fieldset", "legend");
		allow(
			`<fieldset>
			<legend></legend>
			<div></div>
		</fieldset>`,
			"@flow after legend"
		);
		disallow(
			`<fieldset>
			<div></div>
			<legend></legend>
		</fieldset>`,
			"legend after @flow"
		);
	});

	describe("<figcaption>", () => {
		allowParent("figcaption", "figure");
		allowContent("figcaption", "@flow");
	});

	describe("<figure>", () => {
		allowParent("figure", "@flow");
		allowContent("figure", "@flow");
		allowContent("figure", "figcaption");
		allow(
			"<figure><figcaption></figcaption><div></div></figure>",
			"figcaption as first child"
		);
		allow(
			"<figure><div></div><figcaption></figcaption></figure>",
			"figcaption as last child"
		);
		disallow(
			"<figure><figcaption></figcaption><figcaption></figcaption></figure>",
			"multiple figcaption"
		);
	});

	describe("<font>", () => {
		deprecated("font");
	});

	describe("<footer>", () => {
		allowParent("footer", "@flow");
		allowContent("footer", "@flow");
		disallowDescendant("footer", "header");
		disallowDescendant("footer", "footer");
		disallowDescendant("footer", "main");
	});

	describe("<form>", () => {
		allowParent("form", "@flow");
		allowContent("form", "@flow");
		disallowDescendant("form", "form");
	});

	describe("<frame>", () => {
		deprecated("frame");
	});

	describe("<frameset>", () => {
		deprecated("frameset");
	});

	describe("<h1>", () => {
		allowParent("h1", "@flow");
		allowContent("h1", "@phrasing");
		disallowContent("h1", "@flow");
	});

	describe("<h2>", () => {
		allowParent("h2", "@flow");
		allowContent("h2", "@phrasing");
		disallowContent("h2", "@flow");
	});

	describe("<h3>", () => {
		allowParent("h3", "@flow");
		allowContent("h3", "@phrasing");
		disallowContent("h3", "@flow");
	});

	describe("<h4>", () => {
		allowParent("h4", "@flow");
		allowContent("h4", "@phrasing");
		disallowContent("h4", "@flow");
	});

	describe("<h5>", () => {
		allowParent("h5", "@flow");
		allowContent("h5", "@phrasing");
		disallowContent("h5", "@flow");
	});

	describe("<h6>", () => {
		allowParent("h6", "@flow");
		allowContent("h6", "@phrasing");
		disallowContent("h6", "@flow");
	});

	describe("<head>", () => {
		allowParent("head", "html");
		allowContent("head", "@meta");
		disallowContent("head", "@flow");
		disallowContent("head", "@phrasing");
		disallow(
			`<head>
			<base>
			<base>
		</head>`,
			"more than one base"
		);
		disallow(
			`<head>
			<base>
			<base>
		</head>`,
			"more than one title"
		);
	});

	describe("<header>", () => {
		allowParent("header", "@flow");
		allowContent("header", "@flow");
		disallowDescendant("header", "header");
		disallowDescendant("header", "footer");
		disallowDescendant("header", "main");
	});

	describe("<hgroup>", () => {
		deprecated("hgroup");
	});

	describe("<hr>", () => {
		omitEnd("hr");
	});

	describe("<html>", () => {
		allow("<html><head></head></html>", "more than one title");
		disallow(
			`<html>
			<head></head>
			<head></head>
		</html>`,
			"more than one head"
		);
		disallow(
			`<html>
			<body></body>
			<body></body>
		</html>`,
			"more than one body"
		);
		disallow(
			`<html>
			<body></body>
			<head></head>
		</html>`,
			"body before head"
		);
	});

	describe("<i>", () => {
		defaultTextLevel("i");
	});

	describe("<iframe>", () => {
		disallowContent("iframe", "@flow");
		disallowContent("iframe", "@phrasing");
	});

	describe("<img>", () => {
		omitEnd("img");

		it('should be interactive only if "usemap" attribute is set', () => {
			const source = inlineSource("<img/><img usemap/>");
			const parser = htmlvalidate.getParserFor(source);
			const [foo, bar] = parser.parseHtml(source).root.children;
			expect(foo.meta.interactive).toBeFalsy();
			expect(bar.meta.interactive).toBeTruthy();
		});
	});

	describe("<input>", () => {
		omitEnd("input");
		allowAttribute("input", "autofocus", [], "omit");
		allowAttribute("input", "capture", [], "omit");
		allowAttribute("input", "checked", [], "omit");
		allowAttribute("input", "disabled", [], "omit");
		allowAttribute(
			"input",
			"inputmode",
			["none", "text", "numeric"],
			"omit"
		); /* only testing a subset */
		allowAttribute("input", "multiple", [], "omit");
		allowAttribute("input", "readonly", [], "omit");
		allowAttribute("input", "required", [], "omit");
		allowAttribute(
			"input",
			"type",
			["text", "checkbox", "search"],
			"omit"
		); /* only testing a subset */
		disallowAttribute("input", "autofocus", ["foobar"], "omit");
		disallowAttribute("input", "capture", ["foobar"], "omit");
		disallowAttribute("input", "checked", ["foobar"], "omit");
		disallowAttribute("input", "disabled", ["foobar"], "omit");
		disallowAttribute("input", "inputmode", ["foobar"], "omit");
		disallowAttribute("input", "multiple", ["foobar"], "omit");
		disallowAttribute("input", "readonly", ["foobar"], "omit");
		disallowAttribute("input", "required", ["foobar"], "omit");
		disallowAttribute("input", "type", ["foobar"], "omit");

		it('should be interactive only if "type" is not "hidden"', () => {
			const source = inlineSource('<input type="hidden"/><input type="foo"/>');
			const parser = htmlvalidate.getParserFor(source);
			const [foo, bar] = parser.parseHtml(source).root.children;
			expect(foo.meta.interactive).toBeFalsy();
			expect(bar.meta.interactive).toBeTruthy();
		});
	});

	describe("<ins>", () => {
		allow(
			"<span><ins><span>foo</span></ins></span>",
			"phrasing in phrasing context"
		);
		allow("<div><ins><div>foo</div></ins></div>", "flow in flow context");
		disallow(
			"<span><ins><div>foo</div></ins></span>",
			"flow in phrasing context"
		);
	});

	describe("<isindex>", () => {
		deprecated("isindex");
	});

	describe("<kbd>", () => {
		defaultTextLevel("kbd");
	});

	describe("<keygen>", () => {
		omitEnd("keygen");
	});

	describe("<label>", () => {
		allowContent("label", "@phrasing");
		disallowContent("label", "@flow");
		disallowDescendant("label", "label");
	});

	describe("<legend>", () => {
		allowContent("legend", "@phrasing");
		disallowContent("legend", "@flow");
	});

	describe("<li>", () => {
		allowContent("li", "@flow");
	});

	describe("<link>", () => {
		omitEnd("link");
	});

	describe("<listing>", () => {
		deprecated("listing");
	});

	describe("<maín>", () => {
		allowContent("main", "@flow");
	});

	describe("<map>", () => {
		/** @todo what to test? */
	});

	describe("<mark>", () => {
		defaultTextLevel("mark");
	});

	describe("<marquee>", () => {
		deprecated("marquee");
	});

	/** @todo mathml? */
	describe("<math>", () => {
		allowAttribute("math", "dir", ["ltr", "rtl"]);
		allowAttribute("math", "display", ["block", "inline"]);
		allowAttribute("math", "overflow", [
			"linebreak",
			"scroll",
			"elide",
			"truncate",
			"scale",
		]);
		disallowAttribute("math", "dir", ["", "foobar"]);
		disallowAttribute("math", "display", ["", "foobar"]);
		disallowAttribute("math", "overflow", ["", "foobar"]);
	});

	describe("<menu>", () => {
		/** @todo what to test? */
	});

	describe("<meta>", () => {
		omitEnd("meta");
	});

	describe("<meter>", () => {
		allowContent("meter", "@phrasing");
		disallowContent("meter", "@flow");
		disallowDescendant("meter", "meter");
	});

	describe("<multicol>", () => {
		deprecated("multicol");
	});

	describe("<nav>", () => {
		allowContent("nav", "@flow");
		disallowDescendant("nav", "main");
	});

	describe("<nextid>", () => {
		deprecated("nextid");
	});

	describe("<nobr>", () => {
		deprecated("nobr");
	});

	describe("<noembed>", () => {
		deprecated("noembed");
	});

	describe("<noframes>", () => {
		deprecated("noframes");
	});

	/** @todo noscript has more rules for the content model */
	describe("<noscript>", () => {
		disallowDescendant("noscript", "noscript");
	});

	describe("<object>", () => {
		allowContent("object", "@flow");
		allowContent("object", "param", "void");
		allow(
			"<span><object><span>foo</span></object></span>",
			"phrasing in phrasing context"
		);
		allow("<div><object><div>foo</div></object></div>", "flow in flow context");
		disallow(
			"<span><object><div>foo</div></object></span>",
			"flow in phrasing context"
		);
		disallow(
			"<object><param></param><div></div></object>",
			"param before @flow"
		);
		disallow(
			"<object><div></div><param></param></object>",
			"@flow before param"
		);

		it('should be interactive only if "usemap" attribute is set', () => {
			const source = inlineSource("<object></object><object usemap></object>");
			const parser = htmlvalidate.getParserFor(source);
			const [foo, bar] = parser.parseHtml(source).root.children;
			expect(foo.meta.interactive).toBeFalsy();
			expect(bar.meta.interactive).toBeTruthy();
		});
	});

	describe("<ol>", () => {
		allowContent("ol", "li");
		allowContent("ol", "script");
		allowContent("ol", "template");
	});

	describe("<optgroup>", () => {
		allowContent("optgroup", "option");
		allowContent("optgroup", "script");
		allowContent("optgroup", "template");
	});

	describe("<option>", () => {
		allowParent("option", "select");
		allowParent("option", "optgroup");
		disallowContent("option", "@flow");
		disallowContent("option", "@phrasing");
	});

	describe("<output>", () => {
		allowContent("output", "@phrasing");
		disallowContent("output", "@flow");
	});

	describe("<p>", () => {
		allowContent("p", "@phrasing");
		disallow(
			"<p><figure>foo</figure></p>",
			"@flow as content"
		); /* many regular flow content such as <div> will cause <p> to be implicitly closed */
	});

	describe("<param>", () => {
		omitEnd("param");
		allowParent("param", "object", "void");
	});

	describe("<plaintext>", () => {
		deprecated("plaintext");
	});

	describe("<pre>", () => {
		allowContent("pre", "@phrasing");
		disallowContent("pre", "@flow");
	});

	describe("<progress>", () => {
		allowContent("progress", "@phrasing");
		disallowContent("progress", "@flow");
		disallowDescendant("progress", "progress");
	});

	describe("<q>", () => {
		defaultTextLevel("q");
	});

	describe("<rb>", () => {
		allowParent("rb", "ruby");
		allowContent("rb", "@phrasing");
		disallowContent("rb", "@flow");
	});

	describe("<rp>", () => {
		allowParent("rp", "ruby");
		allowContent("rp", "@phrasing");
		disallowContent("rp", "@flow");
	});

	describe("<rt>", () => {
		allowParent("rt", "ruby");
		allowParent("rt", "rtc");
		allowContent("rt", "@phrasing");
		disallowContent("rt", "@flow");
	});

	describe("<rtc>", () => {
		allowParent("rtc", "ruby");
		allowContent("rtc", "@phrasing");
		allowContent("rtc", "rt");
		disallowContent("rtc", "@flow");
	});

	describe("<ruby>", () => {
		allowContent("ruby", "rb");
		allowContent("ruby", "rp");
		allowContent("ruby", "rt");
		allowContent("ruby", "rtc");
		defaultTextLevel("ruby");
	});

	describe("<s>", () => {
		defaultTextLevel("s");
	});

	describe("<samp>", () => {
		defaultTextLevel("samp");
	});

	describe("<script>", () => {
		allowParent("script", "head");
		allowParent("script", "@flow");
	});

	describe("<section>", () => {
		allowContent("section", "@flow");
	});

	describe("<select>", () => {
		allowContent("select", "option");
		allowContent("select", "optgroup");
		allowContent("select", "script");
		allowContent("select", "template");
	});

	describe("<small>", () => {
		defaultTextLevel("small");
	});

	describe("<source>", () => {
		omitEnd("source");
		allowParent("source", "audio", "void");
		allowParent("source", "video", "void");
	});

	describe("<spacer>", () => {
		deprecated("spacer");
	});

	describe("<span>", () => {
		defaultTextLevel("span");
	});

	describe("<strike>", () => {
		deprecated("strike");
	});

	describe("<strong>", () => {
		defaultTextLevel("strong");
	});

	describe("<style>", () => {
		disallowContent("style", "@flow");
		disallowContent("style", "@phrasing");
	});

	describe("<sub>", () => {
		defaultTextLevel("sub");
	});

	describe("<sup>", () => {
		defaultTextLevel("sup");
	});

	describe("<svg>", () => {
		allowContent("svg", "@flow");
	});

	describe("<table>", () => {
		allowContent("table", "caption");
		allowContent("table", "colgroup");
		allowContent("table", "script");
		allowContent("table", "tbody");
		allowContent("table", "template");
		allowContent("table", "tfoot");
		allowContent("table", "thead");
		allowContent("table", "tr");
		disallowContent("table", "@phrasing");
		allow(
			`<table>
			<caption></caption>
			<colgroup></colgroup>
			<thead></thead>
			<tbody></tbody>
			<tfoot></tfoot>
		</table>`,
			"with right order and occurrences"
		);
		disallow(
			`<table>
			<caption></caption>
			<caption></caption>
		</table>`,
			"more than one caption"
		);
		disallow(
			`<table>
			<thead></thead>
			<thead></thead>
		</table>`,
			"more than one thead"
		);
		disallow(
			`<table>
			<tfoot></tfoot>
			<tfoot></tfoot>
		</table>`,
			"more than one tfoot"
		);
		disallow(
			`<table>
			<thead></thead>
			<caption>bar</caption>
		</table>`,
			"caption after thead"
		);
		disallow(
			`<table>
			<tfoot></tfoot>
			<thead></thead>
		</table>`,
			"thead after tfoot"
		);
	});

	describe("<tbody>", () => {
		allowParent("tbody", "table");
		allowContent("tbody", "tr");
		allowContent("tbody", "script");
		allowContent("tbody", "template");
		disallowContent("tbody", "@phrasing");
	});

	describe("<td>", () => {
		allowParent("td", "tr");
		allowContent("td", "@flow");
	});

	describe("<textarea>", () => {
		disallowContent("textarea", "@flow");
		disallowContent("textarea", "@phrasing");
	});

	describe("<tfoot>", () => {
		allowParent("tfoot", "table");
		allowContent("tfoot", "tr");
		allowContent("tfoot", "script");
		allowContent("tfoot", "template");
		disallowContent("tfoot", "@phrasing");
	});

	describe("<th>", () => {
		allowParent("th", "tr");
		allowContent("th", "@flow");
		disallowDescendant("th", "header");
		disallowDescendant("th", "footer");
		disallowDescendant("th", "@sectioning");
		disallowDescendant("th", "@heading");
	});

	describe("<thead>", () => {
		allowParent("thead", "table");
		allowContent("thead", "tr");
		allowContent("thead", "script");
		allowContent("thead", "template");
		disallowContent("thead", "@phrasing");
	});

	describe("<time>", () => {
		defaultTextLevel("time");
	});

	describe("<title>", () => {
		allowParent("title", "head");
		disallowContent("title", "@flow");
		disallowContent("title", "@phrasing");
	});

	describe("<tr>", () => {
		allowParent("tr", "table");
		allowParent("tr", "thead");
		allowParent("tr", "tfoot");
		allowParent("tr", "tbody");
		allowContent("tr", "td");
		allowContent("tr", "th");
		allowContent("tr", "script");
		allowContent("tr", "template");
	});

	describe("<track>", () => {
		omitEnd("track");
	});

	describe("<tt>", () => {
		deprecated("tt");
	});

	describe("<u>", () => {
		defaultTextLevel("u");
	});

	describe("<ul>", () => {
		allowContent("ul", "li");
		allowContent("ul", "script");
		allowContent("ul", "template");
	});

	describe("<var>", () => {
		defaultTextLevel("var");
	});

	describe("<video>", () => {
		allowParent("video", "@flow");
		allow(
			"<span><video><span>foo</span></video></span>",
			"phrasing nested in phrasing"
		);
		disallowDescendant("video", "audio");
		disallowDescendant("video", "video");
		disallow(
			"<span><video><div>foo</div></video></span>",
			"flow nested in phrasing"
		);
		disallow(
			"<video><source></source><track></track><div></div></video>",
			"in right order"
		);
		disallow(
			"<video><track></track><source></source></video>",
			"track before source"
		);
		disallow("<video><div></div><track></track></video>", "@flow before track");
		allowAttribute(
			"video",
			"preload",
			["", "none", "none", "metadata"],
			"auto"
		);
		disallowAttribute("video", "preload", ["foobar"]);

		it('should be interactive only if "controls" attribute is set', () => {
			const source = inlineSource("<video></video><video controls></video>");
			const parser = htmlvalidate.getParserFor(source);
			const [foo, bar] = parser.parseHtml(source).root.children;
			expect(foo.meta.interactive).toBeFalsy();
			expect(bar.meta.interactive).toBeTruthy();
		});
	});

	describe("<wbr>", () => {
		omitEnd("wbr");
	});

	describe("<xmp>", () => {
		deprecated("xmp");
	});
});
