/* eslint-disable no-console -- CLI script is expected to log */

import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import kleur from "kleur";
import { apiExtractor } from "./scripts/api-extractor.mjs";

/**
 * @param {string} src
 * @param {string} dstDir
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
	await copySchema();
}

build().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
