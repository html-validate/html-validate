/**
 * This plugins ensures that a `{@ruleInfo}` tag is retained as-is and is not
 * surrounded by `<p></p>` or similar.
 *
 * @returns {import("marked").MarkedExtension}
 */
function ruleInfoPlugin() {
	return {
		extensions: [
			{
				name: "ruleInfo",
				level: "block",
				start(src) {
					return src.match(/{@ruleInfo}/)?.index;
				},
				tokenizer(src) {
					const rule = /^{@ruleInfo}(?:\n*|$)/;
					const match = rule.exec(src);
					if (match) {
						const token = {
							type: "ruleInfo",
							raw: match[0],
							text: match[0].trim(),
							tokens: [],
						};
						this.lexer.inline(token.text, token.tokens);
						return token;
					} else {
						return undefined;
					}
				},
				renderer() {
					return `{@ruleInfo}`;
				},
			},
		],
	};
}

module.exports = { ruleInfoPlugin };
