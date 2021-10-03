import fs from "fs";
import path from "path";
import { builtinModules } from "module";
import json from "@rollup/plugin-json"; //native solution coming: https://nodejs.org/docs/latest/api/esm.html#esm_json_modules
import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import typescript from "@rollup/plugin-typescript";

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"));

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
const types = [
	"dist/types/index.d.ts",
	"dist/types/browser.d.ts",
	"dist/types/jest/jest.d.ts",
	"dist/types/transform/test-utils.d.ts",
];

/** @type {string[]} */
const inputs = [...entrypoints, ...types];

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
	const base = path.relative(__dirname, id);
	if (inputs.includes(base)) {
		return undefined;
	}

	/** @type {string} */
	const rel = base.startsWith("src/")
		? path.relative(path.join(__dirname, "src"), id)
		: path.relative(path.join(__dirname, "dist/types"), id);

	if (rel.startsWith("cli/")) {
		return "cli";
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
			import path from "path";
			import { fileURLToPath } from "node:url";
			import { createRequire } from "module";
			export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../");
			export const legacyRequire = createRequire(import.meta.url);
			export const distFolder = path.resolve(projectRoot, "dist/${format}");
		`;
	} else {
		return `
			import path from "path";
			export const projectRoot = path.resolve(__dirname, "../../");
			export const legacyRequire = require;
			export const distFolder = path.resolve(projectRoot, "dist/${format}");
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
			},
			external,
			plugins: [
				virtual({
					"src/resolve": generateResolved(format),
				}),
				typescript({
					tsconfig: "src/tsconfig.json",
					outDir: `dist/${format}`,
					declaration: false,
					declarationDir: undefined,
				}),
				json(jsonConfig),
				replace({
					preventAssignment: true,
					delimiters: ["", ""],
					values: {
						/**
						 * Replace __filename global with source filename relative to dist folder
						 *
						 * @param {string} filename
						 */
						__filename: (filename) => {
							const relative = path.relative(path.join(__dirname, "src"), filename);
							return `"@/${relative}"`;
						},
					},
				}),
			],
		},
	];
}

/**
 * @param {string[]} formats
 * @returns {RollupOptions[]}
 */
export function bundleDts(...formats) {
	return formats.map((format) => {
		return {
			input: types,
			output: {
				dir: `dist/${format}`,
				format,
				manualChunks,
				chunkFileNames: "[name].d.ts",
			},
			plugins: [
				dts(),
				copy({
					verbose: true,
					targets: [{ src: "src/schema/*.json", dest: "dist/schema" }],
				}),
			],
		};
	});
}
