import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import kleur from "kleur";
import { apiExtractor } from "./scripts/api-extractor.mjs";

const html5dts = [
	`declare const value: import("html-validate").MetaDataTable;\n`,
	`export default value;\n`,
];

/**
 * @param {string} dst
 * @param {string} content
 * @returns {Promise<void>}
 */
async function writeFile(dst, content) {
	const dir = path.dirname(dst);
	await fs.mkdir(dir, { recursive: true });
	await fs.writeFile(dst, content, "utf8");
	console.log("Writing", kleur.cyan(dst));
}

/**
 * @param {string} src
 * @param {string} dstDir
 * @returns {Promise<void>}
 */
async function copyFile(src, dstDir) {
	const dst = path.join(dstDir, path.basename(src));
	await fs.copyFile(src, dst);
	console.log(src, "->", kleur.cyan(dst));
}

/**
 * @returns {Promise<void>}
 */
async function copySchema() {
	console.group("Copying JSON schemas");
	try {
		const dstDir = "dist/schema";
		const mkdir = fs.mkdir(dstDir, { recursive: true });
		const schemas = await glob("src/schema/*.json");
		await mkdir;
		await Promise.all(schemas.map((src) => copyFile(src, dstDir)));
	} finally {
		console.groupEnd();
	}
}

/**
 * @returns {Promise<void>}
 */
async function build() {
	await apiExtractor(["entrypoints/api-extractor-*.json"]);
	await writeFile("dist/types/html5.d.ts", html5dts.join(""));
	await copySchema();
}

build().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
