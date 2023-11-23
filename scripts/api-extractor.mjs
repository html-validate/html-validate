/* eslint-disable no-console -- expected to log */

import fs from "node:fs/promises";
import path from "node:path";
import isCI from "is-ci";
import { glob } from "glob";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";

/**
 * @param {string[]} patterns
 * @returns {Promise<string[]>}
 */
async function expandPatterns(patterns) {
	const globs = await Promise.all(patterns.map((it) => glob(it)));
	return globs.flat();
}

/**
 * @param {import("@microsoft/api-extractor").ExtractorConfig} config
 * @returns {Promise<void>}
 */
async function patchAugmentations(config) {
	const { mainEntryPointFilePath, rollupEnabled, publicTrimmedFilePath } = config;

	const target = path.basename(publicTrimmedFilePath);

	if (!rollupEnabled) {
		return;
	}

	/**
	 * @returns {Promise<{filename: string[], content: string}>}
	 */
	async function extract(filename) {
		const content = await fs.readFile(filename, "utf-8");
		const matches = content.matchAll(
			/^\/\*\* module augmentation:(.*)\*\/([^]+?^)\/\*\* module augmentation end \*\//gm,
			//			/^\/\*\* module augmentation:(.*)/gm
		);
		return Array.from(matches, (it) => ({
			filename: it[1].split(",").map((jt) => jt.trim()),
			content: it[2],
		})).filter((it) => it.filename.includes(target));
	}

	/**
	 * @param {string} content
	 * @returns {string}
	 */
	function rewriteImport(content) {
		return content.replace(/from ".*";/g, 'from "./index"');
	}

	/**
	 * @param {string} filename
	 * @param {Array<{filename: string[], content: string}>} augmentations
	 * @returns {Promise<void>}
	 */
	async function patch(filename, augmentations) {
		const content = await fs.readFile(filename, "utf-8");
		const patched = [content, ...augmentations.map((it) => rewriteImport(it.content))].join("\n\n");
		await fs.writeFile(filename, patched, "utf-8");
	}

	console.log();
	console.group("Patching module augmentations");
	try {
		const mainDir = path.dirname(mainEntryPointFilePath);
		const pattern = `${mainDir.replace(/\\/g, "/")}/**/*.d.ts`;
		const files = await glob(pattern);
		console.log("Searching", files.length, "declaration files in", mainDir);
		const augmentations = (await Promise.all(files.map(extract))).flat();
		console.log("Found", augmentations.length, "module augmentation(s) matching", target);
		if (augmentations.length > 0) {
			console.log("Writing", publicTrimmedFilePath);
			await patch(publicTrimmedFilePath, augmentations);
		} else {
			console.log("Skipping writing patched declaration");
		}
	} finally {
		console.groupEnd();
	}
}

/**
 * @param {string[]} patterns
 * @returns {Promise<void>}
 */
export async function apiExtractor(patterns) {
	if (isCI) {
		console.log("Running API Extractor in CI mode.");
	} else {
		console.log("Running API Extractor in local mode.");
	}

	const filenames = await expandPatterns(patterns);
	const plural = filenames.length !== 1 ? "s" : "";
	console.group("Processing", filenames.length, `configuration file${plural}:`);
	for (const filename of filenames) {
		console.log("-", filename);
	}
	console.groupEnd();
	console.log();

	if (filenames.length === 0) {
		console.error("No configurations could be found");
		process.exitCode = 1;
		return;
	}

	for (const filename of filenames) {
		const config = ExtractorConfig.loadFileAndPrepare(filename);
		const result = Extractor.invoke(config, {
			localBuild: !isCI,
			showVerboseMessages: true,
		});

		const { succeeded, errorCount, warningCount } = result;
		if (succeeded) {
			console.log(`API Extractor completed successfully`);
		} else {
			console.error(
				`API Extractor completed with ${errorCount} errors and ${warningCount} warnings`,
			);
			process.exitCode = 1;
		}

		await patchAugmentations(config);
	}
}
