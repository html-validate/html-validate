import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { builtinModules } from "node:module";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json"; //native solution coming: https://nodejs.org/docs/latest/api/esm.html#esm_json_modules
import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import esbuild from "rollup-plugin-esbuild";
import MagicString from "magic-string";
import { getRuleUrl } from "./src/utils/get-rule-url.mjs";
import { legacyPlugin } from "@html-validate/rollup-plugin-legacy";
import { packageJsonPlugin } from "@html-validate/rollup-plugin-packagejson";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));
const externalDependencies = packageJson.externalDependencies;
const peerDependencies = Object.keys(packageJson.peerDependencies);

/**
 * @typedef {import('rollup').RollupOptions} RollupOptions
 */

/**
 * List of entrypoints to build.
 *
 * - `in` is the entrypoint input filename.
 * - `out` (optional) is the output name (in dist).
 */
const entrypoints = [
	{ in: "src/index.ts" },
	{ in: "src/browser.ts" },
	{ in: "src/html5.ts" },
	{ in: "src/cli/html-validate.ts" },
	{ in: "src/jest/jest.ts" },
	{ in: "src/vitest/vitest.ts" },
	{ in: "src/jest/worker/worker.ts", out: "jest-worker" },
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
	return relativeId.startsWith("config/resolver/browser/") || relativeId.endsWith(".browser.ts");
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
	if (entrypoints.find((it) => it.in === base)) {
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
			export const importResolve = (specifier) => {
				return new URL(import.meta.resolve(specifier));
			};
		`;
	} else {
		return `
			import { pathToFileURL } from "node:url";
			export const legacyRequire = require;
			export const importResolve = (specifier) => {
				return pathToFileURL(require.resolve(specifier));
			};
		`;
	}
}

/**
 * @returns {import("rollup").Plugin}
 */
function workerPlugin() {
	const mapping = new Map();
	return {
		name: "html-validate:worker-plugin",
		async resolveId(id, importer) {
			if (id.endsWith("?worker&url")) {
				const filePath = id.replace("?worker&url", "");
				const scopedId = `worker:${filePath}`;
				const { id: resolvedId } = await this.resolve(filePath, importer);
				mapping.set(scopedId, resolvedId);
				return scopedId;
			}
			return null;
		},
		async load(id) {
			if (id.startsWith("worker:")) {
				const resolvedId = mapping.get(id);
				return await fs.readFileSync(resolvedId, "utf-8");
			}
			return null;
		},
		transform(_code, id) {
			if (id.startsWith("worker:")) {
				const resolvedId = mapping.get(id);
				const chunkRef = this.emitFile({
					id: resolvedId,
					type: "chunk",
				});
				return {
					code: `export default __getWorkerFilename__("${chunkRef}");`,
					map: { mappings: "" },
				};
			}
			return null;
		},
		renderChunk(code) {
			const regex = /__getWorkerFilename__\("([^"]+)"\)/g;
			const matches = [];
			let match;
			while ((match = regex.exec(code)) !== null) {
				const chunkRef = match[1];
				const filename = this.getFileName(chunkRef);
				matches.push({ filename, begin: match.index, end: regex.lastIndex });
			}
			if (matches.length === 0) {
				return null;
			}
			const ms = new MagicString(code);
			for (const { filename, begin, end } of matches) {
				ms.overwrite(begin, end, JSON.stringify(`./${filename}`));
			}
			return {
				code: ms.toString(),
				map: ms.generateMap({ hires: true }),
			};
		},
	};
}

/**
 * @param {string} format
 * @returns {RollupOptions[]}
 */
export function build(format) {
	return [
		{
			input: entrypoints.map((it) => it.in),
			output: {
				dir: `dist/${format}`,
				format,
				sourcemap: true,
				manualChunks,
				entryFileNames({ facadeModuleId }) {
					const base = path.relative(rootDir, facadeModuleId).replace(/\\/g, "/");
					const entrypoint = entrypoints.find((it) => it.in === base);
					if (entrypoint?.out) {
						return `${entrypoint.out}.js`;
					}
					return "[name].js";
				},
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
				esbuild({
					target: "node18",
					platform: "node",
				}),
				legacyPlugin(),
				workerPlugin(),
				packageJsonPlugin(),
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
