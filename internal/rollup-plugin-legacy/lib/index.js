import path from "node:path";

/**
 * A plugin to handle legacy compatibility.
 *
 * For typescript tooling not respecting the `exports` field it writes a
 * reexporting stub in the output folder pointing to the proper file,
 * e.g. `dist/${format}/foo.d.ts` containing `export * from "../types/foo"`.
 *
 * @returns {import("rollup").Plugin}
 */
export function legacyPlugin() {
	return {
		name: "html-validate:legacy-plugin",
		async generateBundle(options, bundle) {
			const chunks = Object.values(bundle).filter((it) => it.type === "chunk");
			const entrypoints = chunks.filter((it) => it.isEntry);
			for (const entrypoint of entrypoints) {
				const { name } = path.parse(entrypoint.fileName);
				this.emitFile({
					type: "asset",
					fileName: `${name}.d.ts`,
					source: `export * from "../types/${name}";\n`,
				});
			}
		},
	};
}
