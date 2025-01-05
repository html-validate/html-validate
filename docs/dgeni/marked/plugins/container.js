/**
 * @returns {import("marked").MarkedExtension} context
 */
function plugin() {
	const name = "container";
	return {
		extensions: [
			{
				name,
				level: "block",
				start(src) {
					return src.match(/:::/)?.index;
				},
				tokenizer(src) {
					const pattern = /^:::([^\n]*)\n([\s\S]*?)\n:::/;
					const match = src.match(pattern);
					if (match) {
						const [raw, infostring, content] = match;
						const tokens = this.lexer.blockTokens(content);
						const [, variant, rawTitle] = infostring.trim().match(/^(\S*)(\s+.*)?$/);
						if (!variant) {
							throw new Error(`Markdown container missing variant tag`);
						}
						const title = rawTitle ?? variant.toUpperCase();
						return {
							type: name,
							variant,
							titleTokens: this.lexer.inlineTokens(title.trim()),
							raw,
							tokens,
						};
					}
					return undefined;
				},
				renderer(token) {
					const { variant, titleTokens, tokens } = token;
					const title = this.parser.parseInline(titleTokens);
					const content = this.parser.parse(tokens).trim();
					return [
						`<div class="docs-container docs-container--${variant}">`,
						`	<p class="docs-container__title"><span class="docs-container__icon" aria-hidden="true"></span>${title}</p>`,
						`	<div class="docs-container__content">${content}</div>`,
						`</div>`,
						"",
					].join("\n");
				},
			},
		],
	};
}

module.exports = { plugin };
