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
 * @param {Context} context
 * @param {string} text
 * @param {string} infostring
 * @param {boolean} _escaped
 * @returns {string}
 */
function code(context, text, infostring, _escaped) {
	const { example, highlight } = context;
	example.compile(text, infostring);

	const lang = (infostring || "").match(/\S*/)[0];
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
 */
function plugin(context) {
	return {
		renderer: {
			code(text, infostring, escaped) {
				return code(context, text, infostring, escaped);
			},
		},
	};
}

module.exports = { code, plugin };
