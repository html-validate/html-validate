/* eslint-disable sonarjs/no-duplicate-string */

module.exports = {
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
				enum: ["/\\S+/"],
			},
			tabindex: {
				enum: ["/-?\\d+/"],
			},
		},
	},

	a: {
		flow: true,
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
				omit: true,
				enum: ["/.+/"],
			},
			href: {
				enum: ["/.*/"],
			},
			methods: {
				deprecated: true,
			},
			name: {
				deprecated: true,
			},
			shape: {
				deprecated: true,
			},
			urn: {
				deprecated: true,
			},
		},
		permittedDescendants: [{ exclude: "@interactive" }],
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
		phrasing: ["isDescendant", "map"],
		void: true,
		attributes: {
			nohref: {
				deprecated: true,
			},
			shape: {
				enum: ["rect", "circle", "poly", "default"],
			},
		},
		requiredAncestors: ["map"],
	},

	article: {
		flow: true,
		sectioning: true,
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["main"] }],
	},

	aside: {
		flow: true,
		sectioning: true,
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["main"] }],
	},

	audio: {
		flow: true,
		phrasing: true,
		embedded: true,
		interactive: ["hasAttribute", "controls"],
		transparent: ["@flow"],
		attributes: {
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
		permittedContent: ["@flow"],
	},

	body: {
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
		phrasing: true,
		interactive: true,
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
			type: {
				required: true,
				enum: ["submit", "reset", "button"],
			},
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
		permittedContent: ["summary", "@flow"],
		permittedOrder: ["summary", "@flow"],
		requiredContent: ["summary"],
	},

	dfn: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
		permittedDescendants: [{ exclude: ["dfn"] }],
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
		attributes: {
			datafld: {
				deprecated: true,
			},
			disabled: {
				boolean: true,
			},
		},
		permittedContent: ["@flow", "legend?"],
		permittedOrder: ["legend", "@flow"],
	},

	figcaption: {
		permittedContent: ["@flow"],
	},

	figure: {
		flow: true,
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
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["header", "footer", "main"] }],
	},

	form: {
		flow: true,
		form: true,
		attributes: {
			accept: {
				deprecated: true,
			},
			autocomplete: {
				enum: ["on", "off"],
			},
			method: {
				enum: ["get", "post"],
			},
			novalidate: {
				boolean: true,
			},
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
	},

	head: {
		permittedContent: ["base?", "title?", "@meta"],
		requiredContent: ["title"],
		attributes: {
			profile: {
				deprecated: true,
			},
		},
	},

	header: {
		flow: true,
		permittedContent: ["@flow"],
		permittedDescendants: [{ exclude: ["header", "footer", "main"] }],
	},

	hgroup: {
		deprecated: true,
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
	},

	input: {
		flow: true,
		phrasing: true,
		interactive: ["matchAttribute", ["type", "!=", "hidden"]],
		void: true,
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
		attributes: {
			type: {
				deprecated: true,
			},
		},
	},

	link: {
		metadata: true,
		void: true,
		attributes: {
			charset: {
				deprecated: true,
			},
			crossorigin: {
				omit: true,
				enum: ["anonymous", "use-credentials"],
			},
			href: {
				required: true,
				enum: ["/.+/"],
			},
			integrity: {
				enum: ["/.+/"],
			},
			methods: {
				deprecated: true,
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
	},

	map: {
		flow: true,
		phrasing: true,
		transparent: true,
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
	},

	menu: {
		flow: true,
		permittedContent: ["@script", "li"],
	},

	meta: {
		metadata: true,
		void: true,
		attributes: {
			scheme: {
				deprecated: true,
			},
		},
	},

	meter: {
		flow: true,
		phrasing: true,
		labelable: true,
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
		attributes: {
			align: {
				deprecated: true,
			},
			archive: {
				deprecated: true,
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
		permittedContent: ["@script", "li"],
	},

	optgroup: {
		implicitClosed: ["optgroup"],
		attributes: {
			disabled: {
				boolean: true,
			},
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
		permittedContent: [],
	},

	output: {
		flow: true,
		phrasing: true,
		labelable: true,
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
				enum: ["/.+/"],
			},
			language: {
				deprecated: true,
			},
			nomodule: {
				boolean: true,
			},
			src: {
				enum: ["/.+/"],
			},
		},
	},

	section: {
		flow: true,
		sectioning: true,
		permittedContent: ["@flow"],
	},

	select: {
		flow: true,
		phrasing: true,
		interactive: true,
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
		phrasing: true,
		interactive: true,
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
				required: true,
				enum: ["row", "col", "rowgroup", "colgroup", "auto"],
			},
			valign: {
				deprecated: true,
			},
			width: {
				deprecated: true,
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
	},

	time: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	title: {
		metadata: true,
		permittedContent: [],
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
	},

	var: {
		flow: true,
		phrasing: true,
		permittedContent: ["@phrasing"],
	},

	video: {
		flow: true,
		phrasing: true,
		embedded: true,
		interactive: ["hasAttribute", "controls"],
		transparent: ["@flow"],
		attributes: {
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
};
