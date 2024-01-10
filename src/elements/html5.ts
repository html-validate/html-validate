/* eslint-disable sonarjs/no-duplicate-string -- easier to read without constants */

import { defineMetadata } from "../meta/define-metadata";
import { metadataHelper } from "../meta/helper";

const {
	allowedIfAttributeIsPresent,
	allowedIfAttributeIsAbsent,
	allowedIfAttributeHasValue,
	allowedIfParentIsPresent,
} = metadataHelper;

const validId = "/\\S+/";

const ReferrerPolicy = [
	"",
	"no-referrer",
	"no-referrer-when-downgrade",
	"same-origin",
	"origin",
	"strict-origin",
	"origin-when-cross-origin",
	"strict-origin-when-cross-origin",
	"unsafe-url",
];

export default defineMetadata({
	"*": {
		attributes: {
			contenteditable: {
				omit: true,
				enum: ["true", "false"],
			},
			contextmenu: {
				deprecated: true,
			},
			dir: {
				enum: ["ltr", "rtl", "auto"],
			},
			draggable: {
				enum: ["true", "false"],
			},
			hidden: {
				boolean: true,
			},
			id: {
				enum: [validId],
			},
			tabindex: {
				enum: ["/-?\\d+/"],
			},
		},
	},

	a: {
		flow: true,
		focusable(node) {
			return node.hasAttribute("href");
		},
		phrasing: true,
		interactive: true,
		transparent: true,
		attributes: {
			charset: {
				deprecated: true,
			},
			coords: {
				deprecated: true,
			},
			datafld: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			download: {
				allowed: allowedIfAttributeIsPresent("href"),
				omit: true,
				enum: ["/.+/"],
			},
			href: {
				enum: ["/.*/"],
			},
			hreflang: {
				allowed: allowedIfAttributeIsPresent("href"),
			},
			itemprop: {
				allowed: allowedIfAttributeIsPresent("href"),
			},
			methods: {
				deprecated: true,
			},
			name: {
				deprecated: true,
			},
			ping: {
				allowed: allowedIfAttributeIsPresent("href"),
			},
			referrerpolicy: {
				allowed: allowedIfAttributeIsPresent("href"),
				enum: ReferrerPolicy,
			},
			rel: {
				allowed: allowedIfAttributeIsPresent("href"),
			},
			shape: {
				deprecated: true,
			},
			target: {
				allowed: allowedIfAttributeIsPresent("href"),
				enum: ["/[^_].*/", "_blank", "_self", "_parent", "_top"],
			},
			type: {
				allowed: allowedIfAttributeIsPresent("href"),
			},
			urn: {
				deprecated: true,
			},
		},
		permittedDescendants: [{ exclude: "@interactive" }],
		implicitRole(node) {
			return node.hasAttribute("href") ? "link" : null;
		},
	},

	abbr: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	acronym: {
		deprecated: {
			message: "use <abbr> instead",
			documentation: "`<abbr>` can be used as a replacement.",
			source: "html5",
		},
	},

	address: {
		flow: true,
		implicitRole() {
			return "group";
		},
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["address", "header", "footer", "@heading", "@sectioning"] }],
	},

	applet: {
		deprecated: {
			source: "html5",
		},
		attributes: {
			datafld: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
		},
	},

	area: {
		flow: ["isDescendant", "map"],
		focusable(node) {
			return node.hasAttribute("href");
		},
		phrasing: ["isDescendant", "map"],
		void: true,
		attributes: {
			alt: {},
			coords: {
				allowed(node) {
					const attr = node.getAttribute("shape");
					if (attr === "default") {
						return `cannot be used when "shape" attribute is "default"`;
					} else {
						return null;
					}
				},
			},
			download: {
				allowed: allowedIfAttributeIsPresent("href"),
			},
			nohref: {
				deprecated: true,
			},
			itemprop: {
				allowed: allowedIfAttributeIsPresent("href"),
			},
			ping: {
				allowed: allowedIfAttributeIsPresent("href"),
			},
			referrerpolicy: {
				allowed: allowedIfAttributeIsPresent("href"),
				enum: ReferrerPolicy,
			},
			rel: {
				allowed: allowedIfAttributeIsPresent("href"),
			},
			shape: {
				allowed(node, attr) {
					const shape = attr ?? "rect";
					switch (shape) {
						case "circ":
						case "circle":
						case "poly":
						case "polygon":
						case "rect":
						case "rectangle":
							return allowedIfAttributeIsPresent("coords")(node, attr);
						default:
							return null;
					}
				},
				enum: ["rect", "circle", "poly", "default"],
			},
			target: {
				allowed: allowedIfAttributeIsPresent("href"),
				enum: ["/[^_].*/", "_blank", "_self", "_parent", "_top"],
			},
		},
		implicitRole(node) {
			return node.hasAttribute("href") ? "link" : null;
		},
		requiredAncestors: ["map"],
	},

	article: {
		flow: true,
		sectioning: true,
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["main"] }],
		implicitRole() {
			return "article";
		},
	},

	aside: {
		flow: true,
		sectioning: true,
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["main"] }],
		implicitRole() {
			return "complementary";
		},
	},

	audio: {
		flow: true,
		focusable(node) {
			return node.hasAttribute("controls");
		},
		phrasing: true,
		embedded: true,
		interactive: ["hasAttribute", "controls"],
		transparent: ["@flow"],
		attributes: {
			crossorigin: {
				omit: true,
				enum: ["anonymous", "use-credentials"],
			},
			itemprop: {
				allowed: allowedIfAttributeIsPresent("src"),
			},
			preload: {
				omit: true,
				enum: ["none", "metadata", "auto"],
			},
		},
		permittedContent: ["@flow", "track", "source"],
		permittedDescendants: [{ exclude: ["audio", "video"] }],
		permittedOrder: ["source", "track", "@flow"],
	},

	b: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	base: {
		metadata: true,
		void: true,
		permittedParent: ["head"],
	},

	basefont: {
		deprecated: {
			message: "use CSS instead",
			documentation: "Use CSS `font-size` property instead.",
			source: "html4",
		},
	},

	bdi: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	bdo: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	bgsound: {
		deprecated: {
			message: "use <audio> instead",
			documentation:
				"Use the `<audio>` element instead but consider accessibility concerns with autoplaying sounds.",
			source: "non-standard",
		},
	},

	big: {
		deprecated: {
			message: "use CSS instead",
			documentation: "Use CSS `font-size` property instead.",
			source: "html5",
		},
	},

	blink: {
		deprecated: {
			documentation:
				"`<blink>` has no direct replacement and blinking text is frowned upon by accessibility standards.",
			source: "non-standard",
		},
	},

	blockquote: {
		flow: true,
		sectioning: true,
		implicitRole() {
			return "blockquote";
		},
		permittedContent: ["@flow"],
	},

	body: {
		permittedContent: ["@flow"],
		permittedParent: ["html"],
		attributes: {
			alink: {
				deprecated: true,
			},
			background: {
				deprecated: true,
			},
			bgcolor: {
				deprecated: true,
			},
			link: {
				deprecated: true,
			},
			marginbottom: {
				deprecated: true,
			},
			marginheight: {
				deprecated: true,
			},
			marginleft: {
				deprecated: true,
			},
			marginright: {
				deprecated: true,
			},
			margintop: {
				deprecated: true,
			},
			marginwidth: {
				deprecated: true,
			},
			text: {
				deprecated: true,
			},
			vlink: {
				deprecated: true,
			},
		},
	},

	br: {
		flow: true,
		phrasing: true,
		void: true,
		attributes: {
			clear: {
				deprecated: true,
			},
		},
	},

	button: {
		flow: true,
		focusable: true,
		phrasing: true,
		interactive: true,
		formAssociated: {
			listed: true,
		},
		labelable: true,
		attributes: {
			autofocus: {
				boolean: true,
			},
			datafld: {
				deprecated: true,
			},
			dataformatas: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			disabled: {
				boolean: true,
			},
			formaction: {
				allowed: allowedIfAttributeHasValue("type", ["submit"], { defaultValue: "submit" }),
			},
			formenctype: {
				allowed: allowedIfAttributeHasValue("type", ["submit"], { defaultValue: "submit" }),
			},
			formmethod: {
				allowed: allowedIfAttributeHasValue("type", ["submit"], { defaultValue: "submit" }),
				enum: ["get", "post", "dialog"],
			},
			formnovalidate: {
				allowed: allowedIfAttributeHasValue("type", ["submit"], { defaultValue: "submit" }),
				boolean: true,
			},
			formtarget: {
				allowed: allowedIfAttributeHasValue("type", ["submit"], { defaultValue: "submit" }),
				enum: ["/[^_].*/", "_blank", "_self", "_parent", "_top"],
			},
			type: {
				enum: ["submit", "reset", "button"],
			},
		},
		implicitRole() {
			return "button";
		},
		permittedContent: ["@phrasing"],
		permittedDescendants: [{ exclude: ["@interactive"] }],
		textContent: "accessible",
	},

	canvas: {
		flow: true,
		phrasing: true,
		embedded: true,
		transparent: true,
	},

	caption: {
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["table"] }],
		attributes: {
			align: {
				deprecated: true,
			},
		},
	},

	center: {
		deprecated: {
			message: "use CSS instead",
			documentation: "Use the CSS `text-align` or `margin: auto` properties instead.",
			source: "html4",
		},
	},

	cite: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	code: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	col: {
		attributes: {
			align: {
				deprecated: true,
			},
			char: {
				deprecated: true,
			},
			charoff: {
				deprecated: true,
			},
			span: {
				enum: ["/\\d+/"],
			},
			valign: {
				deprecated: true,
			},
			width: {
				deprecated: true,
			},
		},
		void: true,
	},

	colgroup: {
		implicitClosed: ["colgroup"],
		attributes: {
			span: {
				enum: ["/\\d+/"],
			},
		},
		permittedContent: ["col", "template"],
	},

	data: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	datalist: {
		flow: true,
		phrasing: true,
		implicitRole() {
			return "listbox";
		},
		permittedContent: ["@phrasing", "option"],
	},

	dd: {
		implicitClosed: ["dd", "dt"],
		permittedContent: ["@flow"],
		requiredAncestors: ["dl > dd", "dl > div > dd"],
	},

	del: {
		flow: true,
		phrasing: true,
		transparent: true,
	},

	details: {
		flow: true,
		sectioning: true,
		interactive: true,
		attributes: {
			open: {
				boolean: true,
			},
		},
		implicitRole() {
			return "group";
		},
		permittedContent: ["summary", "@flow"],
		permittedOrder: ["summary", "@flow"],
		requiredContent: ["summary"],
	},

	dfn: {
		flow: true,
		phrasing: true,
		implicitRole() {
			return "term";
		},
		permittedContent: ["@phrasing"],
		permittedDescendants: [{ exclude: ["dfn"] }],
	},

	dialog: {
		flow: true,
		permittedContent: ["@flow"],
		attributes: {
			open: {
				boolean: true,
			},
		},
		implicitRole() {
			return "dialog";
		},
	},

	dir: {
		deprecated: {
			documentation:
				"The non-standard `<dir>` element has no direct replacement but MDN recommends replacing with `<ul>` and CSS.",
			source: "html4",
		},
	},

	div: {
		flow: true,
		permittedContent: ["@flow", "dt", "dd"],
		attributes: {
			align: {
				deprecated: true,
			},
			datafld: {
				deprecated: true,
			},
			dataformatas: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
		},
	},

	dl: {
		flow: true,
		permittedContent: ["@script", "dt", "dd", "div"],
		attributes: {
			compact: {
				deprecated: true,
			},
		},
	},

	dt: {
		implicitClosed: ["dd", "dt"],
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["header", "footer", "@sectioning", "@heading"] }],
		requiredAncestors: ["dl > dt", "dl > div > dt"],
	},

	em: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	embed: {
		flow: true,
		phrasing: true,
		embedded: true,
		interactive: true,
		void: true,
		attributes: {
			src: {
				required: true,
				enum: ["/.+/"],
			},
			title: {
				required: true,
			},
		},
	},

	fieldset: {
		flow: true,
		formAssociated: {
			listed: true,
		},
		attributes: {
			datafld: {
				deprecated: true,
			},
			disabled: {
				boolean: true,
			},
		},
		implicitRole() {
			return "group";
		},
		permittedContent: ["@flow", "legend?"],
		permittedOrder: ["legend", "@flow"],
	},

	figcaption: {
		permittedContent: ["@flow"],
	},

	figure: {
		flow: true,
		implicitRole() {
			return "figure";
		},
		permittedContent: ["@flow", "figcaption?"],
		permittedOrder: ["figcaption", "@flow", "figcaption"],
	},

	font: {
		deprecated: {
			message: "use CSS instead",
			documentation: "Use CSS font properties instead.",
			source: "html4",
		},
	},

	footer: {
		flow: true,
		implicitRole(node) {
			const selectors = [
				"article",
				"aside",
				"main",
				"nav",
				"section",
				'[role="article"]',
				'[role="complementary"]',
				'[role="main"]',
				'[role="navigation"]',
				'[role="region"]',
			];
			if (node.closest(selectors.join(","))) {
				return null;
			} else {
				return "contentinfo";
			}
		},
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["header", "footer", "main"] }],
	},

	form: {
		flow: true,
		form: true,
		attributes: {
			action: {
				enum: [/^\s*\S+\s*$/],
			},
			accept: {
				deprecated: true,
			},
			autocomplete: {
				enum: ["on", "off"],
			},
			method: {
				enum: ["get", "post", "dialog"],
			},
			novalidate: {
				boolean: true,
			},
			target: {
				enum: ["/[^_].*/", "_blank", "_self", "_parent", "_top"],
			},
		},
		implicitRole() {
			return "form";
		},
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["@form"] }],
	},

	frame: {
		deprecated: {
			documentation:
				"The `<frame>` element can be replaced with the `<iframe>` element but a better solution is to remove usage of frames entirely.",
			source: "html5",
		},
		attributes: {
			datafld: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			title: {
				required: true,
			},
		},
	},

	frameset: {
		deprecated: {
			documentation:
				"The `<frameset>` element can be replaced with the `<iframe>` element but a better solution is to remove usage of frames entirely.",
			source: "html5",
		},
	},

	h1: {
		flow: true,
		heading: true,
		permittedContent: ["@phrasing"],
		attributes: {
			align: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "heading";
		},
	},

	h2: {
		flow: true,
		heading: true,
		permittedContent: ["@phrasing"],
		attributes: {
			align: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "heading";
		},
	},

	h3: {
		flow: true,
		heading: true,
		permittedContent: ["@phrasing"],
		attributes: {
			align: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "heading";
		},
	},

	h4: {
		flow: true,
		heading: true,
		permittedContent: ["@phrasing"],
		attributes: {
			align: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "heading";
		},
	},

	h5: {
		flow: true,
		heading: true,
		permittedContent: ["@phrasing"],
		attributes: {
			align: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "heading";
		},
	},

	h6: {
		flow: true,
		heading: true,
		permittedContent: ["@phrasing"],
		attributes: {
			align: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "heading";
		},
	},

	head: {
		permittedContent: ["base?", "title?", "@meta"],
		permittedParent: ["html"],
		requiredContent: ["title"],
		attributes: {
			profile: {
				deprecated: true,
			},
		},
	},

	header: {
		flow: true,
		implicitRole(node) {
			const selectors = [
				"article",
				"aside",
				"main",
				"nav",
				"section",
				'[role="article"]',
				'[role="complementary"]',
				'[role="main"]',
				'[role="navigation"]',
				'[role="region"]',
			];
			/* § 4: https://www.w3.org/TR/html-aria/#docconformance */
			/* § 3.4.48: https://w3c.github.io/html-aam/#el-header */
			if (node.closest(selectors.join(","))) {
				return null;
			} else {
				return "banner";
			}
		},
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["header", "footer", "main"] }],
	},

	hgroup: {
		flow: true,
		heading: true,
		permittedContent: ["p", "@heading?"],
		permittedDescendants: [{ exclude: ["hgroup"] }],
		requiredContent: ["@heading"],
	},

	hr: {
		flow: true,
		void: true,
		attributes: {
			align: {
				deprecated: true,
			},
			color: {
				deprecated: true,
			},
			noshade: {
				deprecated: true,
			},
			size: {
				deprecated: true,
			},
			width: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "separator";
		},
	},

	html: {
		permittedContent: ["head?", "body?"],
		permittedOrder: ["head", "body"],
		requiredContent: ["head", "body"],
		attributes: {
			lang: {
				required: true,
			},
			version: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "document";
		},
	},

	i: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	iframe: {
		flow: true,
		phrasing: true,
		embedded: true,
		interactive: true,
		attributes: {
			align: {
				deprecated: true,
			},
			allowtransparency: {
				deprecated: true,
			},
			datafld: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			frameborder: {
				deprecated: true,
			},
			hspace: {
				deprecated: true,
			},
			marginheight: {
				deprecated: true,
			},
			marginwidth: {
				deprecated: true,
			},
			referrerpolicy: {
				enum: ReferrerPolicy,
			},
			scrolling: {
				deprecated: true,
			},
			src: {
				enum: ["/.+/"],
			},
			title: {
				required: true,
			},
			vspace: {
				deprecated: true,
			},
		},
		permittedContent: [],
	},

	img: {
		flow: true,
		phrasing: true,
		embedded: true,
		interactive: ["hasAttribute", "usemap"],
		void: true,
		attributes: {
			align: {
				deprecated: true,
			},
			border: {
				deprecated: true,
			},
			crossorigin: {
				omit: true,
				enum: ["anonymous", "use-credentials"],
			},
			datafld: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			decoding: {
				enum: ["sync", "async", "auto"],
			},
			hspace: {
				deprecated: true,
			},
			ismap: {
				boolean: true,
			},
			lowsrc: {
				deprecated: true,
			},
			name: {
				deprecated: true,
			},
			referrerpolicy: {
				enum: ReferrerPolicy,
			},
			src: {
				required: true,
				enum: ["/.+/"],
			},
			srcset: {
				enum: ["/[^]+/"],
			},
			vspace: {
				deprecated: true,
			},
		},
		implicitRole(node) {
			const alt = node.getAttribute("alt");
			if (alt === "") {
				return "presentation";
			} else {
				return "img";
			}
		},
	},

	input: {
		flow: true,
		focusable(node) {
			return node.getAttribute("type") !== "hidden";
		},
		phrasing: true,
		interactive: ["matchAttribute", ["type", "!=", "hidden"]],
		void: true,
		formAssociated: {
			listed: true,
		},
		labelable: ["matchAttribute", ["type", "!=", "hidden"]],
		attributes: {
			align: {
				deprecated: true,
			},
			autofocus: {
				boolean: true,
			},
			capture: {
				omit: true,
				enum: ["environment", "user"],
			},
			checked: {
				boolean: true,
			},
			datafld: {
				deprecated: true,
			},
			dataformatas: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			disabled: {
				boolean: true,
			},
			formaction: {
				allowed: allowedIfAttributeHasValue("type", ["submit", "image"], {
					defaultValue: "submit",
				}),
			},
			formenctype: {
				allowed: allowedIfAttributeHasValue("type", ["submit", "image"], {
					defaultValue: "submit",
				}),
			},
			formmethod: {
				allowed: allowedIfAttributeHasValue("type", ["submit", "image"], {
					defaultValue: "submit",
				}),
				enum: ["get", "post", "dialog"],
			},
			formnovalidate: {
				allowed: allowedIfAttributeHasValue("type", ["submit", "image"], {
					defaultValue: "submit",
				}),
				boolean: true,
			},
			formtarget: {
				allowed: allowedIfAttributeHasValue("type", ["submit", "image"], {
					defaultValue: "submit",
				}),
				enum: ["/[^_].*/", "_blank", "_self", "_parent", "_top"],
			},
			hspace: {
				deprecated: true,
			},
			inputmode: {
				enum: ["none", "text", "decimal", "numeric", "tel", "search", "email", "url"],
			},
			ismap: {
				deprecated: true,
			},
			multiple: {
				boolean: true,
			},
			readonly: {
				boolean: true,
			},
			required: {
				boolean: true,
			},
			spellcheck: {
				enum: ["default", "false", "true"],
			},
			type: {
				required: true,
				enum: [
					"button",
					"checkbox",
					"color",
					"date",
					"datetime-local",
					"email",
					"file",
					"hidden",
					"image",
					"month",
					"number",
					"password",
					"radio",
					"range",
					"reset",
					"search",
					"submit",
					"tel",
					"text",
					"time",
					"url",
					"week",
				],
			},
			usemap: {
				deprecated: true,
			},
			vspace: {
				deprecated: true,
			},
		},
		/* eslint-disable-next-line complexity -- the standard is complicated */
		implicitRole(node) {
			const list = node.hasAttribute("list");
			if (list) {
				return "combobox";
			}
			const type = node.getAttribute("type");
			switch (type) {
				case "button":
					return "button";
				case "checkbox":
					return "checkbox";
				case "email":
					return "textbox";
				case "image":
					return "button";
				case "number":
					return "spinbutton";
				case "radio":
					return "radio";
				case "range":
					return "slider";
				case "reset":
					return "button";
				case "search":
					return "searchbox";
				case "submit":
					return "button";
				case "tel":
					return "textbox";
				case "text":
					return "textbox";
				case "url":
					return "textbox";
				default:
					return "textbox";
			}
		},
	},

	ins: {
		flow: true,
		phrasing: true,
		transparent: true,
	},

	isindex: {
		deprecated: {
			source: "html4",
		},
	},

	kbd: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	keygen: {
		flow: true,
		phrasing: true,
		interactive: true,
		void: true,
		labelable: true,
		deprecated: true,
	},

	label: {
		flow: true,
		phrasing: true,
		interactive: true,
		permittedContent: ["@phrasing"],
		permittedDescendants: [{ exclude: ["label"] }],
		attributes: {
			datafld: {
				deprecated: true,
			},
			dataformatas: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			for: {
				enum: [validId],
			},
		},
	},

	legend: {
		permittedContent: ["@phrasing", "@heading"],
		attributes: {
			align: {
				deprecated: true,
			},
			datafld: {
				deprecated: true,
			},
			dataformatas: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
		},
	},

	li: {
		implicitClosed: ["li"],
		permittedContent: ["@flow"],
		permittedParent: ["ul", "ol", "menu", "template"],
		attributes: {
			type: {
				deprecated: true,
			},
		},
		implicitRole(node) {
			return node.closest("ul, ol, menu") ? "listitem" : null;
		},
	},

	link: {
		metadata: true,
		void: true,
		attributes: {
			as: {
				allowed: allowedIfAttributeHasValue("rel", ["prefetch", "preload", "modulepreload"]),
				enum: [
					"audio",
					"audioworklet",
					"document",
					"embed",
					"fetch",
					"font",
					"frame",
					"iframe",
					"image",
					"manifest",
					"object",
					"paintworklet",
					"report",
					"script",
					"serviceworker",
					"sharedworker",
					"style",
					"track",
					"video",
					"webidentity",
					"worker",
					"xslt",
				],
			},
			blocking: {
				allowed: allowedIfAttributeHasValue("rel", ["stylesheet", "preload", "modulepreload"]),
				list: true,
				enum: ["render"],
			},
			charset: {
				deprecated: true,
			},
			crossorigin: {
				omit: true,
				enum: ["anonymous", "use-credentials"],
			},
			disabled: {
				allowed: allowedIfAttributeHasValue("rel", ["stylesheet"]),
				boolean: true,
			},
			href: {
				required: true,
				enum: ["/.+/"],
			},
			integrity: {
				allowed: allowedIfAttributeHasValue("rel", ["stylesheet", "preload", "modulepreload"]),
				enum: ["/.+/"],
			},
			methods: {
				deprecated: true,
			},
			referrerpolicy: {
				enum: ReferrerPolicy,
			},
			target: {
				deprecated: true,
			},
			urn: {
				deprecated: true,
			},
		},
	},

	listing: {
		deprecated: {
			source: "html32",
		},
	},

	main: {
		flow: true,
		implicitRole() {
			return "main";
		},
	},

	map: {
		flow: true,
		phrasing: true,
		transparent: true,
		attributes: {
			name: {
				required: true,
				enum: ["/\\S+/"],
			},
		},
	},

	mark: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	marquee: {
		deprecated: {
			documentation:
				"Marked as obsolete by both W3C and WHATWG standards but still implemented in most browsers. Animated text should be avoided for accessibility reasons as well.",
			source: "html5",
		},
		attributes: {
			datafld: {
				deprecated: true,
			},
			dataformatas: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
		},
	},

	math: {
		flow: true,
		foreign: true,
		phrasing: true,
		embedded: true,
		attributes: {
			align: {
				deprecated: true,
			},
			dir: {
				enum: ["ltr", "rtl"],
			},
			display: {
				enum: ["block", "inline"],
			},
			hspace: {
				deprecated: true,
			},
			name: {
				deprecated: true,
			},
			overflow: {
				enum: ["linebreak", "scroll", "elide", "truncate", "scale"],
			},
			vspace: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "math";
		},
	},

	menu: {
		flow: true,
		implicitRole() {
			return "list";
		},
		permittedContent: ["@script", "li"],
	},

	meta: {
		flow: ["hasAttribute", "itemprop"],
		phrasing: ["hasAttribute", "itemprop"],
		metadata: true,
		void: true,
		attributes: {
			charset: {
				enum: ["utf-8"],
			},
			content: {
				allowed: allowedIfAttributeIsPresent("name", "http-equiv", "itemprop", "property"),
			},
			itemprop: {
				allowed: allowedIfAttributeIsAbsent("http-equiv", "name"),
			},
			name: {
				allowed: allowedIfAttributeIsAbsent("http-equiv", "itemprop"),
			},
			"http-equiv": {
				allowed: allowedIfAttributeIsAbsent("name", "itemprop"),
			},
			scheme: {
				deprecated: true,
			},
		},
	},

	meter: {
		flow: true,
		phrasing: true,
		labelable: true,
		implicitRole() {
			return "meter";
		},
		permittedContent: ["@phrasing"],
		permittedDescendants: [{ exclude: "meter" }],
	},

	multicol: {
		deprecated: {
			message: "use CSS instead",
			documentation: "Use CSS columns instead.",
			source: "html5",
		},
	},

	nav: {
		flow: true,
		sectioning: true,
		implicitRole() {
			return "navigation";
		},
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: "main" }],
	},

	nextid: {
		deprecated: {
			source: "html32",
		},
	},

	nobr: {
		deprecated: {
			message: "use CSS instead",
			documentation: "Use CSS `white-space` property instead.",
			source: "non-standard",
		},
	},

	noembed: {
		deprecated: {
			source: "non-standard",
		},
	},

	noframes: {
		deprecated: {
			source: "html5",
		},
	},

	noscript: {
		metadata: true,
		flow: true,
		phrasing: true,
		transparent: true,
		permittedDescendants: [{ exclude: "noscript" }],
	},

	object: {
		flow: true,
		phrasing: true,
		embedded: true,
		interactive: ["hasAttribute", "usemap"],
		transparent: true,
		formAssociated: {
			listed: true,
		},
		attributes: {
			align: {
				deprecated: true,
			},
			archive: {
				deprecated: true,
			},
			blocking: {
				list: true,
				enum: ["render"],
			},
			border: {
				deprecated: true,
			},
			classid: {
				deprecated: true,
			},
			code: {
				deprecated: true,
			},
			codebase: {
				deprecated: true,
			},
			codetype: {
				deprecated: true,
			},
			data: {
				enum: ["/.+/"],
				required: true,
			},
			datafld: {
				deprecated: true,
			},
			dataformatas: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			declare: {
				deprecated: true,
			},
			hspace: {
				deprecated: true,
			},
			name: {
				enum: ["/[^_].*/"],
			},
			standby: {
				deprecated: true,
			},
			vspace: {
				deprecated: true,
			},
		},
		permittedContent: ["param", "@flow"],
		permittedOrder: ["param", "@flow"],
	},

	ol: {
		flow: true,
		attributes: {
			compact: {
				deprecated: true,
			},
			reversed: {
				boolean: true,
			},
			type: {
				enum: ["a", "A", "i", "I", "1"],
			},
		},
		implicitRole() {
			return "list";
		},
		permittedContent: ["@script", "li"],
	},

	optgroup: {
		implicitClosed: ["optgroup"],
		attributes: {
			disabled: {
				boolean: true,
			},
		},
		implicitRole() {
			return "group";
		},
		permittedContent: ["@script", "option"],
	},

	option: {
		implicitClosed: ["option"],
		attributes: {
			dataformatas: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			disabled: {
				boolean: true,
			},
			name: {
				deprecated: true,
			},
			selected: {
				boolean: true,
			},
		},
		implicitRole() {
			return "option";
		},
		permittedContent: [],
	},

	output: {
		flow: true,
		phrasing: true,
		formAssociated: {
			listed: true,
		},
		labelable: true,
		implicitRole() {
			return "status";
		},
		permittedContent: ["@phrasing"],
	},

	p: {
		flow: true,
		implicitClosed: [
			"address",
			"article",
			"aside",
			"blockquote",
			"div",
			"dl",
			"fieldset",
			"footer",
			"form",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"header",
			"hgroup",
			"hr",
			"main",
			"nav",
			"ol",
			"p",
			"pre",
			"section",
			"table",
			"ul",
		],
		permittedContent: ["@phrasing"],
		attributes: {
			align: {
				deprecated: true,
			},
		},
	},

	param: {
		void: true,
		attributes: {
			datafld: {
				deprecated: true,
			},
			type: {
				deprecated: true,
			},
			valuetype: {
				deprecated: true,
			},
		},
	},

	picture: {
		flow: true,
		phrasing: true,
		embedded: true,
		permittedContent: ["@script", "source", "img"],
		permittedOrder: ["source", "img"],
	},

	plaintext: {
		deprecated: {
			message: "use <pre> or CSS instead",
			documentation: "Use the `<pre>` element or use CSS to set a monospace font.",
			source: "html2",
		},
	},

	pre: {
		flow: true,
		permittedContent: ["@phrasing"],
		attributes: {
			width: {
				deprecated: true,
			},
		},
	},

	progress: {
		flow: true,
		phrasing: true,
		labelable: true,
		implicitRole() {
			return "progressbar";
		},
		permittedContent: ["@phrasing"],
		permittedDescendants: [{ exclude: "progress" }],
	},

	q: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	rb: {
		implicitClosed: ["rb", "rt", "rtc", "rp"],
		permittedContent: ["@phrasing"],
	},

	rp: {
		implicitClosed: ["rb", "rt", "rtc", "rp"],
		permittedContent: ["@phrasing"],
	},

	rt: {
		implicitClosed: ["rb", "rt", "rtc", "rp"],
		permittedContent: ["@phrasing"],
	},

	rtc: {
		implicitClosed: ["rb", "rtc", "rp"],
		permittedContent: ["@phrasing", "rt"],
	},

	ruby: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing", "rb", "rp", "rt", "rtc"],
	},

	s: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	samp: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	script: {
		metadata: true,
		flow: true,
		phrasing: true,
		scriptSupporting: true,
		attributes: {
			async: {
				boolean: true,
			},
			crossorigin: {
				omit: true,
				enum: ["anonymous", "use-credentials"],
			},
			defer: {
				boolean: true,
			},
			event: {
				deprecated: true,
			},
			for: {
				deprecated: true,
			},
			integrity: {
				allowed: allowedIfAttributeIsPresent("src"),
				enum: ["/.+/"],
			},
			language: {
				deprecated: true,
			},
			nomodule: {
				boolean: true,
			},
			referrerpolicy: {
				enum: ReferrerPolicy,
			},
			src: {
				enum: ["/.+/"],
			},
		},
	},

	search: {
		flow: true,
		implicitRole() {
			return "search";
		},
	},

	section: {
		flow: true,
		sectioning: true,
		implicitRole() {
			return "region";
		},
		permittedContent: ["@flow"],
	},

	select: {
		flow: true,
		focusable: true,
		phrasing: true,
		interactive: true,
		formAssociated: {
			listed: true,
		},
		labelable: true,
		attributes: {
			autofocus: {
				boolean: true,
			},
			disabled: {
				boolean: true,
			},
			multiple: {
				boolean: true,
			},
			required: {
				boolean: true,
			},
			size: {
				enum: ["/\\d+/"],
			},
		},
		implicitRole(node) {
			const multiple = node.hasAttribute("multiple");
			if (multiple) {
				return "listbox";
			}
			const size = node.getAttribute("size");
			if (typeof size === "string") {
				const parsed = parseInt(size, 10);
				if (parsed > 1) {
					return "listbox";
				}
			}
			return "combobox";
		},
		permittedContent: ["@script", "datasrc", "datafld", "dataformatas", "option", "optgroup"],
	},

	slot: {
		flow: true,
		phrasing: true,
		transparent: true,
	},

	small: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	source: {
		void: true,
		attributes: {
			type: {},
			media: {},
			src: {
				allowed: allowedIfParentIsPresent("audio", "video"),
			},
			srcset: {
				allowed: allowedIfParentIsPresent("picture"),
			},
			sizes: {
				allowed: allowedIfParentIsPresent("picture"),
			},
			width: {
				allowed: allowedIfParentIsPresent("picture"),
				enum: ["/\\d+/"],
			},
			height: {
				allowed: allowedIfParentIsPresent("picture"),
				enum: ["/\\d+/"],
			},
		},
	},

	spacer: {
		deprecated: {
			message: "use CSS instead",
			documentation: "Use CSS margin or padding instead.",
			source: "non-standard",
		},
	},

	span: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		attributes: {
			datafld: {
				deprecated: true,
			},
			dataformatas: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
		},
	},

	strike: {
		deprecated: {
			message: "use <del> or <s> instead",
			documentation: "Use the `<del>` or `<s>` element instead.",
			source: "html5",
		},
	},

	strong: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	style: {
		metadata: true,
	},

	sub: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	summary: {
		permittedContent: ["@phrasing", "@heading"],
	},

	sup: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	svg: {
		flow: true,
		foreign: true,
		phrasing: true,
		embedded: true,
	},

	/* while not part of HTML 5 specification these two elements are handled as
	 * special cases to allow them as accessible text and to avoid issues with
	 * "no-unknown-elements" they are added here */
	"svg:desc": {},
	"svg:title": {},

	table: {
		flow: true,
		permittedContent: ["@script", "caption?", "colgroup", "tbody", "tfoot?", "thead?", "tr"],
		permittedOrder: ["caption", "colgroup", "thead", "tbody", "tr", "tfoot"],
		attributes: {
			align: {
				deprecated: true,
			},
			background: {
				deprecated: true,
			},
			bgcolor: {
				deprecated: true,
			},
			bordercolor: {
				deprecated: true,
			},
			cellpadding: {
				deprecated: true,
			},
			cellspacing: {
				deprecated: true,
			},
			dataformatas: {
				deprecated: true,
			},
			datapagesize: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			frame: {
				deprecated: true,
			},
			rules: {
				deprecated: true,
			},
			summary: {
				deprecated: true,
			},
			width: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "table";
		},
	},

	tbody: {
		implicitClosed: ["tbody", "tfoot"],
		permittedContent: ["@script", "tr"],
		attributes: {
			align: {
				deprecated: true,
			},
			background: {
				deprecated: true,
			},
			char: {
				deprecated: true,
			},
			charoff: {
				deprecated: true,
			},
			valign: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "rowgroup";
		},
	},

	td: {
		flow: true,
		implicitClosed: ["td", "th"],
		attributes: {
			align: {
				deprecated: true,
			},
			axis: {
				deprecated: true,
			},
			background: {
				deprecated: true,
			},
			bgcolor: {
				deprecated: true,
			},
			char: {
				deprecated: true,
			},
			charoff: {
				deprecated: true,
			},
			colspan: {
				enum: ["/\\d+/"],
			},
			height: {
				deprecated: true,
			},
			nowrap: {
				deprecated: true,
			},
			rowspan: {
				enum: ["/\\d+/"],
			},
			scope: {
				deprecated: true,
			},
			valign: {
				deprecated: true,
			},
			width: {
				deprecated: true,
			},
		},
		implicitRole(node) {
			if (node.closest('table[role="grid"], table[role="treegrid"]')) {
				return "gridcell";
			} else if (node.closest("table")) {
				return "cell";
			} else {
				return null;
			}
		},
		permittedContent: ["@flow"],
	},

	template: {
		metadata: true,
		flow: true,
		phrasing: true,
		scriptSupporting: true,
	},

	textarea: {
		flow: true,
		focusable: true,
		phrasing: true,
		interactive: true,
		formAssociated: {
			listed: true,
		},
		labelable: true,
		attributes: {
			autocomplete: {
				enum: ["on", "off"],
			},
			autofocus: {
				boolean: true,
			},
			cols: {
				enum: ["/\\d+/"],
			},
			datafld: {
				deprecated: true,
			},
			datasrc: {
				deprecated: true,
			},
			disabled: {
				boolean: true,
			},
			maxlength: {
				enum: ["/\\d+/"],
			},
			minlength: {
				enum: ["/\\d+/"],
			},
			readonly: {
				boolean: true,
			},
			required: {
				boolean: true,
			},
			rows: {
				enum: ["/\\d+/"],
			},
			spellcheck: {
				enum: ["true", "default", "false"],
			},
			wrap: {
				enum: ["hard", "soft"],
			},
		},
		implicitRole() {
			return "textbox";
		},
		permittedContent: [],
	},

	tfoot: {
		implicitClosed: ["tbody"],
		permittedContent: ["@script", "tr"],
		attributes: {
			align: {
				deprecated: true,
			},
			background: {
				deprecated: true,
			},
			char: {
				deprecated: true,
			},
			charoff: {
				deprecated: true,
			},
			valign: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "rowgroup";
		},
	},

	th: {
		flow: true,
		implicitClosed: ["td", "th"],
		attributes: {
			align: {
				deprecated: true,
			},
			axis: {
				deprecated: true,
			},
			background: {
				deprecated: true,
			},
			bgcolor: {
				deprecated: true,
			},
			char: {
				deprecated: true,
			},
			charoff: {
				deprecated: true,
			},
			colspan: {
				enum: ["/\\d+/"],
			},
			height: {
				deprecated: true,
			},
			nowrap: {
				deprecated: true,
			},
			rowspan: {
				enum: ["/\\d+/"],
			},
			scope: {
				enum: ["row", "col", "rowgroup", "colgroup"],
			},
			valign: {
				deprecated: true,
			},
			width: {
				deprecated: true,
			},
		},
		implicitRole(node) {
			const table = node.closest("table");
			if (!table) {
				return null;
			}
			const tableRole = table.getAttribute("role") ?? "table";
			if (typeof tableRole !== "string" || !["table", "grid", "treegrid"].includes(tableRole)) {
				return null;
			}
			const scope = node.getAttribute("scope");
			switch (scope) {
				case "col":
					return "columnheader";
				case "row":
					return "rowheader";
				default:
					return tableRole === "table" ? "cell" : "gridcell";
			}
		},
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["header", "footer", "@sectioning", "@heading"] }],
	},

	thead: {
		implicitClosed: ["tbody", "tfoot"],
		permittedContent: ["@script", "tr"],
		attributes: {
			align: {
				deprecated: true,
			},
			background: {
				deprecated: true,
			},
			char: {
				deprecated: true,
			},
			charoff: {
				deprecated: true,
			},
			valign: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "rowgroup";
		},
	},

	time: {
		flow: true,
		phrasing: true,
		implicitRole() {
			return "time";
		},
		permittedContent: ["@phrasing"],
	},

	title: {
		metadata: true,
		permittedContent: [],
		permittedParent: ["head"],
	},

	tr: {
		implicitClosed: ["tr"],
		permittedContent: ["@script", "td", "th"],
		attributes: {
			align: {
				deprecated: true,
			},
			background: {
				deprecated: true,
			},
			bgcolor: {
				deprecated: true,
			},
			char: {
				deprecated: true,
			},
			charoff: {
				deprecated: true,
			},
			valign: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "row";
		},
	},

	track: {
		void: true,
	},

	tt: {
		deprecated: {
			documentation:
				"Use a more semantically correct element such as `<code>`, `<var>` or `<pre>`.",
			source: "html4",
		},
	},

	u: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	ul: {
		flow: true,
		permittedContent: ["@script", "li"],
		attributes: {
			compact: {
				deprecated: true,
			},
			type: {
				deprecated: true,
			},
		},
		implicitRole() {
			return "list";
		},
	},

	var: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	video: {
		flow: true,
		focusable(node) {
			return node.hasAttribute("controls");
		},
		phrasing: true,
		embedded: true,
		interactive: ["hasAttribute", "controls"],
		transparent: ["@flow"],
		attributes: {
			crossorigin: {
				omit: true,
				enum: ["anonymous", "use-credentials"],
			},
			itemprop: {
				allowed: allowedIfAttributeIsPresent("src"),
			},
			preload: {
				omit: true,
				enum: ["none", "metadata", "auto"],
			},
		},
		permittedContent: ["@flow", "track", "source"],
		permittedDescendants: [{ exclude: ["audio", "video"] }],
		permittedOrder: ["source", "track", "@flow"],
	},

	wbr: {
		flow: true,
		phrasing: true,
		void: true,
	},

	xmp: {
		deprecated: {
			documentation: "Use `<pre>` or `<code>` and escape content using HTML entities instead.",
			source: "html32",
		},
	},
});
