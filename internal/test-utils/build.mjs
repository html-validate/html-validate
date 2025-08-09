import fs from "node:fs/promises";
import { build, analyzeMetafile } from "esbuild";
import { apiExtractor } from "../../scripts/api-extractor.mjs";

const folder = {
	cjs: "cjs",
	esm: "es",
};

for (const format of ["cjs", "esm"]) {
	const outdir = `../../dist/${folder[format]}`;
	const name = "test-utils";
	const result = await build({
		bundle: true,
		entryPoints: [{ in: "src/index.ts", out: name }],
		outdir,
		format,
		platform: "node",
		target: "node20",
		logLevel: "info",
		metafile: true,
		sourcemap: true,
		external: ["html-validate"],
	});
	const legacyDts = `export * from "../types/${name}";\n`;
	await fs.writeFile(`${outdir}/${name}.d.ts`, legacyDts, "utf-8");
	if (format === "esm") {
		console.log(await analyzeMetafile(result.metafile));
	}
}

await apiExtractor(["api-extractor.json"]);
