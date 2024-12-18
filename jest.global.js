const { build } = require("esbuild");

module.exports = function setup() {
	return build({
		entryPoints: ["src/jest/worker/worker.ts"],
		bundle: true,
		format: "cjs",
		outfile: "temp/jest-worker.js",
		platform: "node",
		target: "node16",
		plugins: [
			{
				name: "html-validate:get-rule-url",
				setup(build) {
					/* stub get-rule-url.mjs as it only runs in ESM but we are targeting CommonJS */
					build.onLoad({ filter: /get-rule-url.mjs$/ }, () => {
						return {
							contents: [
								`export function getRuleUrl() {`,
								`    return "https://html-validate.org/rule-mock-url.html";`,
								`};`,
							].join("\n"),
							loader: "js",
						};
					});
				},
			},
		],
	});
};
