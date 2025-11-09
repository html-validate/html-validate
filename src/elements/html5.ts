import { type MetaDataTable } from "../meta";
import { metadataHelper } from "../meta/helper";
import { type HtmlElementLike } from "../meta/html-element-like";

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

function isInsideLandmark(node: HtmlElementLike): boolean {
	/* § 4: https://www.w3.org/TR/html-aria/#docconformance */
	/* § 3.4.42: https://w3c.github.io/html-aam/#el-footer */
	/* § 3.4.48: https://w3c.github.io/html-aam/#el-header */
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
	return Boolean(node.closest(selectors.join(",")));
}

function linkBodyOk(node: HtmlElementLike): boolean {
	/* with itemprop the element is always body ok */
	if (node.hasAttribute("itemprop")) {
		return true;
	}

	/* if the rel attribute is missing it cannot be body ok */
	const rel = node.getAttribute("rel");
	if (!rel) {
		return false;
	}

	/* for dynamic rel attributes assume it is body ok */
	/* istanbul ignore next: tests run without dynamic elements */
	if (typeof rel !== "string") {
		return false;
	}

	/* only when rel matches one of these keywords it is body ok */
	const bodyOk = [
		"dns-prefetch",
		"modulepreload",
		"pingback",
		"preconnect",
		"prefetch",
		"preload",
		"stylesheet",
	];
	const tokens = rel.toLowerCase().split(/\s+/);
	return tokens.some((keyword) => bodyOk.includes(keyword));
}

export default {
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
				omit: true,
				enum: ["hidden", "until-found"],
			},
			id: {
				enum: [validId],
			},
			inert: {
				boolean: true,
			},
			spellcheck: {
				omit: true,
				enum: ["true", "false"],
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
		interactive(node) {
			/* "If the element has an href attribute: Interactive content."
			 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element */
			return node.hasAttribute("href");
		},
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
				allowed(node, attr) {
					if (!node.hasAttribute("href")) {
						return `requires "href" attribute to be present`;
					}
					if (!attr || attr === "" || typeof attr !== "string") {
						return null;
					}
					const disallowed = [
						/* whatwg */
						"canonical",
						"dns-prefetch",
						"expect",
						"icon",
						"manifest",
						"modulepreload",
						"pingback",
						"preconnect",
						"prefetch",
						"preload",
						"stylesheet",

						/* microformats.org */
						"apple-touch-icon",
						"apple-touch-icon-precomposed",
						"apple-touch-startup-image",
						"authorization_endpoint",
						"component",
						"chrome-webstore-item",
						"dns-prefetch",
						"edit",
						"gbfs",
						"gtfs-static",
						"gtfs-realtime",
						"import",
						"mask-icon",
						"meta",
						"micropub",
						"openid.delegate",
						"openid.server",
						"openid2.local_id",
						"openid2.provider",
						"p3pv1",
						"pgpkey",
						"schema.dcterms",
						"service",
						"shortlink",
						"sitemap",
						"subresource",
						"sword",
						"timesheet",
						"token_endpoint",
						"wlwmanifest",
						"stylesheet/less",
						"token_endpoint",
						"yandex-tableau-widget",
					];
					const tokens = attr.toLowerCase().split(/\s+/);
					for (const keyword of tokens) {
						if (disallowed.includes(keyword)) {
							return `<a> does not allow rel="${keyword}"`;
						}
						if (keyword.startsWith("dcterms.")) {
							return `<a> does not allow rel="${keyword}"`;
						}
					}
					return null;
				},
				list: true,
				enum: ["/.+/"],
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
		permittedDescendants: [
			/* "Transparent, but there must be no interactive content descendant, a
			 * element descendant, or descendant with the tabindex attribute
			 * specified." */
			{ exclude: ["@interactive", "a"] },
		],
		aria: {
			implicitRole(node) {
				return node.hasAttribute("href") ? "link" : "generic";
			},
			naming(node) {
				return node.hasAttribute("href") ? "allowed" : "prohibited";
			},
		},
	},

	abbr: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "group",
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
		flow(node) {
			return Boolean(node.closest("map"));
		},
		focusable(node) {
			return node.hasAttribute("href");
		},
		phrasing(node) {
			return Boolean(node.closest("map"));
		},
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
				allowed(node, attr) {
					if (!node.hasAttribute("href")) {
						return `requires "href" attribute to be present`;
					}
					if (!attr || attr === "" || typeof attr !== "string") {
						return null;
					}
					const disallowed = [
						/* whatwg */
						"canonical",
						"dns-prefetch",
						"expect",
						"icon",
						"manifest",
						"modulepreload",
						"pingback",
						"preconnect",
						"prefetch",
						"preload",
						"stylesheet",

						/* microformats.org */
						"apple-touch-icon",
						"apple-touch-icon-precomposed",
						"apple-touch-startup-image",
						"authorization_endpoint",
						"component",
						"chrome-webstore-item",
						"dns-prefetch",
						"edit",
						"gbfs",
						"gtfs-static",
						"gtfs-realtime",
						"import",
						"mask-icon",
						"meta",
						"micropub",
						"openid.delegate",
						"openid.server",
						"openid2.local_id",
						"openid2.provider",
						"p3pv1",
						"pgpkey",
						"schema.dcterms",
						"service",
						"shortlink",
						"sitemap",
						"subresource",
						"sword",
						"timesheet",
						"token_endpoint",
						"wlwmanifest",
						"stylesheet/less",
						"token_endpoint",
						"yandex-tableau-widget",
					];
					const tokens = attr.toLowerCase().split(/\s+/);
					for (const keyword of tokens) {
						if (disallowed.includes(keyword)) {
							return `<area> does not allow rel="${keyword}"`;
						}
						if (keyword.startsWith("dcterms.")) {
							return `<area> does not allow rel="${keyword}"`;
						}
					}
					return null;
				},
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
		aria: {
			implicitRole(node) {
				return node.hasAttribute("href") ? "link" : "generic";
			},
			naming(node) {
				return node.hasAttribute("href") ? "allowed" : "prohibited";
			},
		},
		requiredAncestors: ["map", "template"],
	},

	article: {
		flow: true,
		sectioning: true,
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["main"] }],
		aria: {
			implicitRole: "article",
		},
	},

	aside: {
		flow: true,
		sectioning: true,
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["main"] }],
		aria: {
			implicitRole: "complementary",
		},
	},

	audio: {
		flow: true,
		focusable(node) {
			return node.hasAttribute("controls");
		},
		phrasing: true,
		embedded: true,
		interactive(node) {
			return node.hasAttribute("controls");
		},
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
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
	},

	base: {
		metadata: true,
		void: true,
		permittedParent: ["head"],
		aria: {
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
	},

	bdo: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "blockquote",
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
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
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
		aria: {
			naming: "prohibited",
		},
	},

	button: {
		flow: true,
		focusable: true,
		phrasing: true,
		interactive: true,
		formAssociated: {
			disablable: true,
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
		aria: {
			implicitRole: "button",
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
		aria: {
			implicitRole: "caption",
			naming: "prohibited",
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
		aria: {
			naming: "prohibited",
		},
	},

	code: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "code",
			naming: "prohibited",
		},
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
		aria: {
			naming: "prohibited",
		},
	},

	colgroup: {
		implicitClosed: ["colgroup"],
		attributes: {
			span: {
				enum: ["/\\d+/"],
			},
		},
		permittedContent: ["col", "template"],
		aria: {
			naming: "prohibited",
		},
	},

	data: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
	},

	datalist: {
		flow: true,
		phrasing: true,
		aria: {
			implicitRole: "listbox",
			naming: "prohibited",
		},
		permittedContent: ["@phrasing", "option"],
	},

	dd: {
		implicitClosed: ["dd", "dt"],
		permittedContent: ["@flow"],
		requiredAncestors: ["dl > dd", "dl > div > dd", "template > dd", "template > div > dd"],
	},

	del: {
		flow: true,
		phrasing: true,
		transparent: true,
		aria: {
			implicitRole: "deletion",
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "group",
		},
		permittedContent: ["summary", "@flow"],
		permittedOrder: ["summary", "@flow"],
		requiredContent: ["summary"],
	},

	dfn: {
		flow: true,
		phrasing: true,
		aria: {
			implicitRole: "term",
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
		aria: {
			implicitRole: "dialog",
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
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
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
		requiredAncestors: ["dl > dt", "dl > div > dt", "template > dt", "template > div > dt"],
	},

	em: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "emphasis",
			naming: "prohibited",
		},
	},

	embed: {
		flow: true,
		phrasing: true,
		embedded: true,
		interactive: true,
		void: true,
		attributes: {
			height: {
				enum: ["/\\d+/"],
			},
			src: {
				required: true,
				enum: ["/.+/"],
			},
			title: {
				required: true,
			},
			width: {
				enum: ["/\\d+/"],
			},
		},
	},

	fieldset: {
		flow: true,
		formAssociated: {
			disablable: true,
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
		aria: {
			implicitRole: "group",
		},
		permittedContent: ["@flow", "legend?"],
		permittedOrder: ["legend", "@flow"],
	},

	figcaption: {
		permittedContent: ["@flow"],
		aria: {
			naming: "prohibited",
		},
	},

	figure: {
		flow: true,
		aria: {
			implicitRole: "figure",
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
		aria: {
			implicitRole(node) {
				if (isInsideLandmark(node)) {
					return "generic";
				} else {
					return "contentinfo";
				}
			},
			naming(node) {
				if (isInsideLandmark(node)) {
					return "prohibited";
				} else {
					return "allowed";
				}
			},
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
			rel: {
				allowed(_, attr) {
					if (!attr || attr === "" || typeof attr !== "string") {
						return null;
					}
					const disallowed = [
						/* whatwg */
						"alternate",
						"canonical",
						"author",
						"bookmark",
						"dns-prefetch",
						"expect",
						"icon",
						"manifest",
						"modulepreload",
						"pingback",
						"preconnect",
						"prefetch",
						"preload",
						"privacy-policy",
						"stylesheet",
						"tag",
						"terms-of-service",
					];
					const tokens = attr.toLowerCase().split(/\s+/);
					for (const keyword of tokens) {
						if (disallowed.includes(keyword)) {
							return `<form> does not allow rel="${keyword}"`;
						}
					}
					return null;
				},
				list: true,
				enum: ["/.+/"],
			},
			target: {
				enum: ["/[^_].*/", "_blank", "_self", "_parent", "_top"],
			},
		},
		aria: {
			implicitRole: "form",
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
		aria: {
			implicitRole: "heading",
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
		aria: {
			implicitRole: "heading",
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
		aria: {
			implicitRole: "heading",
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
		aria: {
			implicitRole: "heading",
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
		aria: {
			implicitRole: "heading",
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
		aria: {
			implicitRole: "heading",
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
		aria: {
			naming: "prohibited",
		},
	},

	header: {
		flow: true,
		aria: {
			implicitRole(node) {
				if (isInsideLandmark(node)) {
					return "generic";
				} else {
					return "banner";
				}
			},
			naming(node) {
				if (isInsideLandmark(node)) {
					return "prohibited";
				} else {
					return "allowed";
				}
			},
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
		aria: {
			implicitRole: "group",
		},
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
		aria: {
			implicitRole: "separator",
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
		aria: {
			implicitRole: "document",
			naming: "prohibited",
		},
	},

	i: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
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
			height: {
				enum: ["/\\d+/"],
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
			width: {
				enum: ["/\\d+/"],
			},
		},
		permittedContent: [],
	},

	img: {
		flow: true,
		phrasing: true,
		embedded: true,
		interactive(node) {
			return node.hasAttribute("usemap");
		},
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
			height: {
				enum: ["/\\d+/"],
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
			width: {
				enum: ["/\\d+/"],
			},
		},
		aria: {
			implicitRole(node) {
				const alt = node.getAttribute("alt");
				const ariaLabel = node.getAttribute("aria-label");
				const ariaLabelledBy = node.getAttribute("aria-labelledby");
				const title = node.getAttribute("title");
				if (alt === "" && !ariaLabel && !ariaLabelledBy && !title) {
					return "none";
				} else {
					return "img";
				}
			},
			naming(node) {
				const alt = node.getAttribute("alt");
				const ariaLabel = node.getAttribute("aria-label");
				const ariaLabelledBy = node.getAttribute("aria-labelledby");
				const title = node.getAttribute("title");
				if (!alt && !ariaLabel && !ariaLabelledBy && !title) {
					return "prohibited";
				} else {
					return "allowed";
				}
			},
		},
	},

	input: {
		flow: true,
		focusable(node) {
			return node.getAttribute("type") !== "hidden";
		},
		phrasing: true,
		interactive(node) {
			return node.getAttribute("type") !== "hidden";
		},
		void: true,
		formAssociated: {
			disablable: true,
			listed: true,
		},
		labelable(node) {
			return node.getAttribute("type") !== "hidden";
		},
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
			type: {
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
		aria: {
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
					case "color":
						return null;
					case "date":
						return null;
					case "datetime-local":
						return null;
					case "email":
						return "textbox";
					case "file":
						return null;
					case "hidden":
						return null;
					case "image":
						return "button";
					case "month":
						return null;
					case "number":
						return "spinbutton";
					case "password":
						return null;
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
					case "time":
						return null;
					case "url":
						return "textbox";
					case "week":
						return null;
					default:
						return "textbox";
				}
			},
			naming(node) {
				return node.getAttribute("type") !== "hidden" ? "allowed" : "prohibited";
			},
		},
	},

	ins: {
		flow: true,
		phrasing: true,
		transparent: true,
		aria: {
			implicitRole: "insertion",
			naming: "prohibited",
		},
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
		aria: {
			naming: "prohibited",
		},
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
		aria: {
			naming: "prohibited",
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
		aria: {
			naming: "prohibited",
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
		aria: {
			implicitRole(node) {
				return node.closest("ul, ol, menu") ? "listitem" : "generic";
			},
		},
	},

	link: {
		metadata: true,
		flow(node) {
			return linkBodyOk(node);
		},
		phrasing(node) {
			return linkBodyOk(node);
		},
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
				allowed: allowedIfAttributeHasValue("rel", ["expect", "stylesheet"]),
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
			rel: {
				allowed(_, attr) {
					if (!attr || attr === "" || typeof attr !== "string") {
						return null;
					}
					const disallowed = [
						/* whatwg */
						"bookmark",
						"external",
						"nofollow",
						"noopener",
						"noreferrer",
						"opener",
						"tag",

						/* microformats.org */
						"disclosure",
						"entry-content",
						"lightbox",
						"lightvideo",
					];
					const tokens = attr.toLowerCase().split(/\s+/);
					for (const keyword of tokens) {
						if (disallowed.includes(keyword)) {
							return `<link> does not allow rel="${keyword}"`;
						}
					}
					return null;
				},
				list: true,
				enum: ["/.+/"],
			},
			target: {
				deprecated: true,
			},
			urn: {
				deprecated: true,
			},
		},
		aria: {
			naming: "prohibited",
		},
	},

	listing: {
		deprecated: {
			source: "html32",
		},
	},

	main: {
		flow: true,
		aria: {
			implicitRole: "main",
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
		aria: {
			naming: "prohibited",
		},
	},

	mark: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "math",
		},
	},

	menu: {
		flow: true,
		aria: {
			implicitRole: "list",
		},
		permittedContent: ["@script", "li"],
	},

	meta: {
		flow(node) {
			return node.hasAttribute("itemprop");
		},
		phrasing(node) {
			return node.hasAttribute("itemprop");
		},
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
		aria: {
			naming: "prohibited",
		},
	},

	meter: {
		flow: true,
		phrasing: true,
		labelable: true,
		aria: {
			implicitRole: "meter",
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
		aria: {
			implicitRole: "navigation",
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
		aria: {
			naming: "prohibited",
		},
	},

	object: {
		flow: true,
		phrasing: true,
		embedded: true,
		interactive(node) {
			return node.hasAttribute("usemap");
		},
		transparent: true,
		formAssociated: {
			disablable: false,
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
			height: {
				enum: ["/\\d+/"],
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
			width: {
				enum: ["/\\d+/"],
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
		aria: {
			implicitRole: "list",
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
		aria: {
			implicitRole: "group",
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
		aria: {
			implicitRole: "option",
		},
		permittedContent: ["@phrasing", "div"],
		permittedDescendants: [{ exclude: ["@interactive", "datalist", "object"] }],
	},

	output: {
		flow: true,
		phrasing: true,
		formAssociated: {
			disablable: false,
			listed: true,
		},
		labelable: true,
		aria: {
			implicitRole: "status",
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
		aria: {
			implicitRole: "paragraph",
			naming: "prohibited",
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
		aria: {
			naming: "prohibited",
		},
	},

	picture: {
		flow: true,
		phrasing: true,
		embedded: true,
		permittedContent: ["@script", "source", "img"],
		permittedOrder: ["source", "img"],
		aria: {
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
	},

	progress: {
		flow: true,
		phrasing: true,
		labelable: true,
		aria: {
			implicitRole: "progressbar",
		},
		permittedContent: ["@phrasing"],
		permittedDescendants: [{ exclude: "progress" }],
	},

	q: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
	},

	rb: {
		implicitClosed: ["rb", "rt", "rtc", "rp"],
		permittedContent: ["@phrasing"],
	},

	rp: {
		implicitClosed: ["rb", "rt", "rtc", "rp"],
		permittedContent: ["@phrasing"],
		aria: {
			naming: "prohibited",
		},
	},

	rt: {
		implicitClosed: ["rb", "rt", "rtc", "rp"],
		permittedContent: ["@phrasing"],
		aria: {
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "deletion",
			naming: "prohibited",
		},
	},

	samp: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
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
		aria: {
			naming: "prohibited",
		},
	},

	search: {
		flow: true,
		aria: {
			implicitRole: "search",
		},
	},

	section: {
		flow: true,
		sectioning: true,
		aria: {
			implicitRole(node) {
				const name = node.hasAttribute("aria-label") || node.hasAttribute("aria-labelledby");
				return name ? "region" : "generic";
			},
		},
		permittedContent: ["@flow"],
	},

	select: {
		flow: true,
		focusable: true,
		phrasing: true,
		interactive: true,
		formAssociated: {
			disablable: true,
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
		aria: {
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
		},
		/* "Zero or one button elements if the select is a drop-down box, followed
		 * by zero or more select element inner content element."
		 *
		 * "The following are select element inner content elements:
		 * option, optgroup, hr, script-supporting elements, noscript, div"
		 *
		 * https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element
		 */
		permittedContent: [
			"@script",
			"button?",
			"datasrc",
			"datafld",
			"dataformatas",
			"option",
			"optgroup",
			"hr",
		],
		permittedOrder: ["button", "option, optgroup, hr"],
	},

	selectedcontent: {
		phrasing: true,
		permittedContent: [],
		textContent: "none",
		requiredAncestors: ["select > button"],
	},

	slot: {
		flow: true,
		phrasing: true,
		transparent: true,
		aria: {
			naming: "prohibited",
		},
	},

	small: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
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
		aria: {
			naming: "prohibited",
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
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
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
		aria: {
			implicitRole: "strong",
			naming: "prohibited",
		},
	},

	style: {
		metadata: true,
		aria: {
			naming: "prohibited",
		},
	},

	sub: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "subscript",
			naming: "prohibited",
		},
	},

	summary: {
		permittedContent: ["@phrasing", "@heading"],
		focusable(node) {
			return Boolean(node.closest("details"));
		},
		aria: {
			implicitRole: "button",
		},
	},

	sup: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			implicitRole: "superscript",
			naming: "prohibited",
		},
	},

	svg: {
		flow: true,
		foreign: true,
		phrasing: true,
		embedded: true,
		aria: {
			implicitRole: "graphics-document",
		},
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
		aria: {
			implicitRole: "table",
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
		aria: {
			implicitRole: "rowgroup",
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
		aria: {
			implicitRole(node) {
				const table = node.closest("table");
				const tableRole = table?.getAttribute("role") ?? "table";
				switch (tableRole) {
					case "table":
						return "cell";
					case "grid":
					case "treegrid":
						return "gridcell";
					default:
						return null;
				}
			},
		},
		permittedContent: ["@flow"],
	},

	template: {
		metadata: true,
		flow: true,
		phrasing: true,
		scriptSupporting: true,
		templateRoot: true,
		aria: {
			naming: "prohibited",
		},
	},

	textarea: {
		flow: true,
		focusable: true,
		phrasing: true,
		interactive: true,
		formAssociated: {
			disablable: true,
			listed: true,
		},
		labelable: true,
		attributes: {
			autocomplete: {},
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
			wrap: {
				enum: ["hard", "soft"],
			},
		},
		aria: {
			implicitRole: "textbox",
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
		aria: {
			implicitRole: "rowgroup",
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
		aria: {
			implicitRole(node) {
				const table = node.closest("table");
				const tableRole = table?.getAttribute("role") ?? "table";
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
		aria: {
			implicitRole: "rowgroup",
		},
	},

	time: {
		flow: true,
		phrasing: true,
		aria: {
			implicitRole: "time",
			naming: "prohibited",
		},
		permittedContent: ["@phrasing"],
	},

	title: {
		metadata: true,
		permittedContent: [],
		permittedParent: ["head"],
		aria: {
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "row",
		},
	},

	track: {
		void: true,
		aria: {
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "generic",
			naming: "prohibited",
		},
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
		aria: {
			implicitRole: "list",
		},
	},

	var: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		aria: {
			naming: "prohibited",
		},
	},

	video: {
		flow: true,
		focusable(node) {
			return node.hasAttribute("controls");
		},
		phrasing: true,
		embedded: true,
		interactive(node) {
			return node.hasAttribute("controls");
		},
		transparent: ["@flow"],
		attributes: {
			crossorigin: {
				omit: true,
				enum: ["anonymous", "use-credentials"],
			},
			height: {
				enum: ["/\\d+/"],
			},
			itemprop: {
				allowed: allowedIfAttributeIsPresent("src"),
			},
			preload: {
				omit: true,
				enum: ["none", "metadata", "auto"],
			},
			width: {
				enum: ["/\\d+/"],
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
		aria: {
			naming: "prohibited",
		},
	},

	xmp: {
		deprecated: {
			documentation: "Use `<pre>` or `<code>` and escape content using HTML entities instead.",
			source: "html32",
		},
	},
} satisfies MetaDataTable;
