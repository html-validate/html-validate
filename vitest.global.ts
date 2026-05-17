import { build } from "esbuild";

export default async function setup(): Promise<void> {
	await build({
		entryPoints: ["src/vitest/worker/vitest-worker.ts"],
		bundle: true,
		format: "esm",
		outfile: "temp/vitest-worker.mjs",
		platform: "node",
		target: "node22",
		banner: {
			js: ["const __filename = import.meta.filename;"].join("\n"),
		},
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
}
