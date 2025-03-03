const type = {
	es: "module",
	cjs: "commonjs",
};

/**
 * A plugin to write a `package.json` in the output folder with the `type`
 * field set to match the output format.
 *
 * @returns {import("rollup").Plugin}
 */
export function packageJsonPlugin() {
	return {
		name: "html-validate:packagejson-plugin",
		generateBundle(options) {
			const { format } = options;
			const content = {
				type: type[format],
			};
			this.emitFile({
				type: "asset",
				fileName: "package.json",
				source: JSON.stringify(content, null, 2),
			});
		},
	};
}
