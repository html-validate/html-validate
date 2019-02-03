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
