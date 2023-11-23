const fs = require("fs");
const path = require("node:path");

/**
 * @typedef {import("../services/example").Example} Example
 * @typedef {import("../services/example").ExampleDefinition} ExampleDefinition
 */

/**
 * Replaces `require(..)` with a fake function to allow "importing" anything
 * including fake files.
 *
 * @param {string} value
 * @param {ExampleDefinition} definition
 * @returns {string}
 */
function fakeRequire(value, definition) {
	if (definition.fakeRequire) {
		return value
			.replace(/(^|\s)require\("[^"]+"\)/g, `require("mock-any")`)
			.replace(/\sfrom "([^"]+)"/g, (_, mod) => {
				return mod !== "html-validate" ? ` from "mock-any"` : ` from "html-validate"`;
			});
	} else {
		return value;
	}
}

/**
 * Forces the file to be a ES module by injecting "export {}" if the file
 * doesn't already export something.
 *
 * @param {string} value
 * @param {ExampleDefinition} definition
 * @returns {string}
 */
function forceModule(value, definition) {
	if (definition.lang !== "ts" || value.match(/^export /)) {
		return value;
	} else {
		return `${value}\n\nexport {}\n`;
	}
}

/**
 * Adjusts the source code to allow compiling.
 *
 * @param {string} value
 * @param {ExampleDefinition} definition
 * @returns {string}
 */
function prepareCode(value, definition) {
	value = fakeRequire(value, definition);
	value = forceModule(value, definition);
	return value;
}

/**
 * @param {Example} example
 */
module.exports = function generateExamplesCodeProcessor(log, example) {
	return {
		$runAfter: ["renderDocsProcessor"],
		$process,
		outDir: null,
	};

	function $process() {
		const { outDir } = this;
		if (!outDir) {
			log.warn(
				"No output directory has been configured for generateCompileExamplesProcessor, skipped",
			);
		}

		const dir = path.join(outDir, "src");
		fs.rmSync(dir, { recursive: true, force: true });
		fs.mkdirSync(dir, { recursive: true });

		for (const [id, definition] of example.entries()) {
			const dst = path.join(dir, `${id}.${definition.lang}`);
			const code = prepareCode(definition.code, definition);
			fs.writeFileSync(dst, code, "utf-8");
			log.debug(`written file ${dst}`);
		}
	}
};
