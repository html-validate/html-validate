const { createSyncFn } = require("synckit");

const prettier = {
	/** @type {import("prettier").resolveConfig} */
	resolveConfig: createSyncFn(require.resolve("./prettier-resolve-config.mjs")),
	/** @type {import("prettier").format} */
	format: createSyncFn(require.resolve("./prettier-format.mjs")),
};

/**
 * @typedef {import("../../example/services/example").Example} Example
 * @typedef {(code: string, lang: string | undefined) => string} Highlighter
 * @typedef {{example: Example, highlight: Highlighter}} Context
 */

function removePreamble(code) {
	return code.replace(/[^]*\/\* --- \*\/\n+/gm, "");
}

function stripEslintComments(code) {
	return code.replace(/\/\* eslint-disable.*\n/g, "");
}

const isEmpty = RegExp.prototype.test.bind(/^\s*$/);
const prettierConfig = prettier.resolveConfig("docs/stub.js", {
	editorconfig: true,
});

function calcIndent(text) {
	const MAX_INDENT = 9999;
	const lines = text.split("\n");
	let minIndent = MAX_INDENT;
	let emptyLinesRemoved = false;

	// ignore leading empty lines
	while (isEmpty(lines[0])) {
		lines.shift();
		emptyLinesRemoved = true;
	}

	if (lines.length) {
		// ignore first line if it has no indentation and there is more than one line
		// this is because sometimes our text starts in the middle of a line of other
		// text that is indented and so doesn't appear to have an indent when it really does.
		const ignoreLine = lines[0][0] !== " " && lines.length > 1;
		if (ignoreLine && !emptyLinesRemoved) {
			lines.shift();
		}

		lines.forEach((line) => {
			if (!isEmpty(line)) {
				const indent = line.match(/^\s*/)[0].length;
				minIndent = Math.min(minIndent, indent);
			}
		});
	}

	return minIndent;
}

function trimIndent(text, indent) {
	const lines = text.split("\n");

	/* eslint-disable-next-line security/detect-non-literal-regexp -- not arbitrary user data */
	const indentRegExp = new RegExp(`^\\s{0,${indent}}`);

	// remove the indentation
	for (let i = 0; i < lines.length; i++) {
		lines[i] = lines[i].replace(indentRegExp, "");
	}

	// remove leading lines
	while (isEmpty(lines[0])) {
		lines.shift();
	}

	// remove trailing
	while (isEmpty(lines[lines.length - 1])) {
		lines.pop();
	}

	return lines.join("\n");
}

function trimIndentation(text) {
	return trimIndent(text, calcIndent(text));
}

/**
 * @param {string} text
 * @param {string} lang
 */
function renderConfig(context, text, lang, infostring) {
	const { example, highlight } = context;

	if (!["json", "jsonc"].includes(lang)) {
		throw new Error(`Config examples should be defined as "json" or "jsonc", got "${lang}"`);
	}

	const jsonText = text;
	const cjsText = prettier.format(
		[
			`const { defineConfig } = require("html-validate");`,
			``,
			`module.exports = defineConfig(${text});`,
		].join("\n"),
		{ ...prettierConfig, tabWidth: 2, useTabs: false, filepath: "docs/stub.js" },
	);

	example.compile(cjsText, infostring);

	const renderedJson = highlight(jsonText, "jsonc");
	const renderedCJS = highlight(cjsText, "js");

	return /* HTML */ `
		<div class="config-tabs">
			<div class="config-tabs__bar">
				<div class="config-tabs__filename">.htmlvalidate.json</div>
			</div>
			<pre
				data-key="json"
				data-filename=".htmlvalidate.json"
				data-label="JSON"
			><code class="hljs language-jsonc">${renderedJson}</code></pre>
			<pre
				data-key="cjs"
				data-filename=".htmlvalidate.js"
				data-label="CommonJS"
				hidden
			><code class="hljs language-js">${renderedCJS}</code></pre>
		</div>
	`;
}

/**
 * @param {Context} context
 * @param {string} text
 * @param {string} infostring
 * @param {boolean} _escaped
 * @returns {string}
 */
function code(context, text, infostring, _escaped) {
	const { example, highlight } = context;
	example.compile(text, infostring);

	const [lang, ...tags] = (infostring ?? "").split(/\s+/);
	if (tags.includes("config")) {
		return renderConfig(context, text, lang, infostring);
	}

	const processedCode = stripEslintComments(removePreamble(trimIndentation(text)));
	let renderedCode = highlight(processedCode, lang);

	// Bug in marked - forgets to add a final newline sometimes
	if (!/\n$/.test(renderedCode)) {
		renderedCode += "\n";
	}

	const classes = ["hljs"];
	if (lang) {
		classes.push(`language-${lang}`);
	}

	return `<pre><code class="${classes.join(" ")}">${renderedCode}</code></pre>`;
}

/**
 * @param {Context} context
 * @returns {import("marked").MarkedExtension} context
 */
function plugin(context) {
	return {
		useNewRenderer: true,
		renderer: {
			code({ text, lang, escaped }) {
				return code(context, text, lang, escaped);
			},
		},
	};
}

module.exports = { code, plugin };
