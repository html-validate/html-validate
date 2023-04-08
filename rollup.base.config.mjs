import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import { builtinModules } from "module";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json"; //native solution coming: https://nodejs.org/docs/latest/api/esm.html#esm_json_modules
import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import typescript from "@rollup/plugin-typescript";
import getRuleUrl from "./src/utils/get-rule-url.js";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));

/**
 * @typedef {import('rollup').RollupOptions} RollupOptions
 */

/** @type {string[]} */
const entrypoints = [
	"src/index.ts",
	"src/browser.ts",
	"src/cli/html-validate.ts",
	"src/jest/jest.ts",
	"src/transform/test-utils.ts",
];

/** @type {string[]} */
const external = [
	/* nodejs */
	...builtinModules,
	...builtinModules.map((name) => `node:${name}`), //spec: https://nodejs.org/docs/latest/api/esm.html#esm_node_imports

	/* npm dependencies */
	...Object.keys(packageJson.dependencies),
	...Object.keys(packageJson.peerDependencies),
];

const jsonConfig = {
	preferConst: true,
};

/**
 * @param {string} id
 * @returns {string|undefined}
 */
function manualChunks(id) {
	/** @type {string} */
	const base = path.relative(rootDir, id).replace(/\\/g, "/");
	if (entrypoints.includes(base)) {
		return undefined;
	}

	/** @type {string} */
	const rel = base.startsWith("src/")
		? path.relative(path.join(rootDir, "src"), id).replace(/\\/g, "/")
		: path.relative(path.join(rootDir, "dist/types"), id).replace(/\\/g, "/");

	if (rel.startsWith("cli/")) {
		return "cli";
	}

	if (rel.startsWith("elements/")) {
		return "elements";
	}

	if (rel.startsWith("meta/helper") || rel.startsWith("meta/define-metadata")) {
		return "meta-helper";
	}

	if (rel.startsWith("rules/helper")) {
		return "rules-helper";
	}

	if (rel.startsWith("jest/")) {
		return "jest-lib";
	}

	return "core";
}

/**
 * @param {string} format
 * @returns {string}
 */
function generateResolved(format) {
	if (format === "es") {
		return `
			import { createRequire } from "module";
			export const legacyRequire = createRequire(import.meta.url);
		`;
	} else {
		return `
			export const legacyRequire = require;
		`;
	}
}

/**
 * @param {string} format
 * @returns {RollupOptions[]}
 */
export function build(format) {
	return [
		{
			input: entrypoints,
			output: {
				dir: `dist/${format}`,
				format,
				sourcemap: true,
				manualChunks,
				chunkFileNames: "[name].js",
				interop: "auto",
			},
			preserveEntrySignatures: "strict",
			external,
			plugins: [
				virtual({
					"src/resolve": generateResolved(format),
				}),
				typescript({
					tsconfig: "tsconfig.json",
					outDir: `dist/${format}`,
					declaration: false,
					declarationMap: false,
					declarationDir: undefined,
				}),
				json(jsonConfig),
				nodeResolve(),
				replace({
					preventAssignment: true,
					delimiters: ["", ""],
					values: {
						/**
						 * Replace __filename global with source filename relative to dist folder
						 *
						 * @param {string} filename
						 */
						"ruleDocumentationUrl(__filename)"(filename) {
							return JSON.stringify(getRuleUrl(filename, packageJson.homepage));
						},
					},
				}),
			],
		},
	];
}
