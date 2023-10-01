import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { builtinModules } from "node:module";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json"; //native solution coming: https://nodejs.org/docs/latest/api/esm.html#esm_json_modules
import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import typescript from "@rollup/plugin-typescript";
import { getRuleUrl } from "./src/utils/get-rule-url.mjs";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));
const externalDependencies = packageJson.externalDependencies;
const peerDependencies = Object.keys(packageJson.peerDependencies);

/**
 * @typedef {import('rollup').RollupOptions} RollupOptions
 */

/** @type {string[]} */
const entrypoints = [
	"src/index.ts",
	"src/browser.ts",
	"src/html5.ts",
	"src/cli/html-validate.ts",
	"src/jest/jest.ts",
	"src/vitest/vitest.ts",
	"src/transform/test-utils.ts",
];

/** @type {string[]} */
const external = [
	/* nodejs */
	...builtinModules,
	...builtinModules.map((name) => `node:${name}`), //spec: https://nodejs.org/docs/latest/api/esm.html#esm_node_imports

	/* npm dependencies */
	...externalDependencies,
	...peerDependencies,
];

const jsonConfig = {
	preferConst: true,
};

/**
 * @param {string} id
 * @returns {boolean}
 */
function isNodejsChunk(relativeId) {
	const files = ["config/loaders/file-system.ts", "utils/require-uncached.ts"];
	return (
		files.includes(relativeId) ||
		relativeId.startsWith("config/resolver/nodejs/") ||
		relativeId.endsWith("src/resolve") ||
		relativeId.endsWith(".nodejs.ts")
	);
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isBrowserChunk(relativeId) {
	return relativeId.endsWith(".browser.ts");
}

/**
 * @param {string} rel
 * @returns {string}
 */
function jestChunks(rel) {
	if (rel.startsWith("jest/matchers/")) {
		if (rel.includes("codeframe")) {
			return "matchers-jestonly";
		} else {
			return "matchers";
		}
	}

	/* this is a special case where the jest-diff import should only be present
	 * when importing though this entrypoint, e.g. vitest should not have to rely
	 * on jest-diff being installed */
	if (rel.startsWith("jest/utils/diff")) {
		return "jest-diff";
	}

	if (rel.startsWith("jest/")) {
		return "matcher-utils";
	}

	return "core";
}

/**
 * @param {string} id
 * @returns {string|undefined}
 */
/* eslint-disable-next-line complexity -- needed to be like this */
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

	if (isNodejsChunk(rel)) {
		return "core-nodejs";
	}

	if (isBrowserChunk(rel)) {
		return "core-browser";
	}

	if (rel.startsWith("utils")) {
		const parsed = path.parse(rel);
		const split = ["natural-join"];
		if (split.includes(parsed.name)) {
			return `utils/${parsed.name}`;
		} else {
			return "core";
		}
	}

	if (rel.startsWith("jest/")) {
		return jestChunks(rel);
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
			import { createRequire } from "node:module";
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
			treeshake: {
				preset: "smallest",
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
				commonjs(),
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
