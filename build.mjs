import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import { glob } from "glob";
import { rollup } from "rollup";
import { getRollupConfig } from "./rollup.config.mjs";
import { apiExtractor } from "./scripts/api-extractor.mjs";

/**
 * @typedef {import("rollup").OutputChunk} OutputChunk
 * @typedef {import("rollup").OutputAsset} OutputAsset
 */

/**
 * @typedef {TreeFileNode | TreeDirNode} TreeNode
 *
 * @typedef {object} TreeFileNode
 * @property {"file"} type
 * @property {string} name
 * @property {number} size
 * @property {boolean} isEntry
 * @property {"chunk" | "asset"} kind
 *
 * @typedef {object} TreeDirNode
 * @property {"dir"} type
 * @property {string} name
 * @property {TreeNode[]} children
 */

/**
 * File size thresholds for colorizing output.
 */
const sizeThresholds = {
	warn: 10 * 1024 /* 10 kB */,
	error: 100 * 1024 /* 100 kB */,
};

/**
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} kB`;
	}
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * @param {number} ms
 * @returns {string}
 */
function formatTime(ms) {
	return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

/**
 * @param {number} size
 * @returns {string}
 */
function sizeColor(size) {
	if (size >= sizeThresholds.error) {
		return "red";
	}
	if (size >= sizeThresholds.warn) {
		return "white";
	}
	return "gray";
}

/**
 * @param {OutputChunk | OutputAsset} file
 * @returns {number}
 */
function fileSize(file) {
	return file.type === "chunk" ? file.code.length : file.source.length;
}

/**
 * @param {Array<OutputChunk | OutputAsset>} files
 * @returns {TreeNode[]}
 */
function buildTree(files) {
	/** @type {TreeNode[]} */
	const root = [];

	for (const file of files) {
		const parts = file.fileName.split("/");
		let nodes = root;
		for (let i = 0; i < parts.length - 1; i++) {
			const dirName = parts[i];
			let dir = /** @type {TreeDirNode | undefined} */ (
				nodes.find((n) => n.type === "dir" && n.name === dirName)
			);
			if (!dir) {
				dir = { type: "dir", name: dirName, children: [] };
				nodes.push(dir);
			}
			nodes = dir.children;
		}
		nodes.push({
			type: "file",
			name: parts.at(-1),
			size: fileSize(file),
			isEntry: file.type === "chunk" && file.isEntry,
			kind: file.type,
		});
	}

	return root;
}

/**
 * @param {TreeNode[]} nodes
 * @param {string} [prefix]
 */
function printTree(nodes, prefix = " ") {
	/**
	 * @param {TreeNode} node
	 * @returns {number}
	 */
	function sortKey(node) {
		return node.type === "file" && node.kind === "chunk" && node.isEntry ? 0 : 1;
	}
	const sorted = nodes.toSorted((a, b) => {
		const ka = sortKey(a);
		const kb = sortKey(b);
		if (ka !== kb) {
			return ka - kb;
		}
		return a.name.localeCompare(b.name);
	});
	for (let i = 0; i < sorted.length; i++) {
		const node = sorted[i];
		const isLast = i === sorted.length - 1;
		const connector = styleText("gray", isLast ? "└── " : "├── ");
		const childPrefix = prefix + styleText("gray", isLast ? "    " : "│   ");
		if (node.type === "dir") {
			const name = `${node.name}/`;
			console.log(`${prefix}${connector}${styleText("cyan", name)}`);
			printTree(node.children, childPrefix);
		} else {
			const name = node.isEntry ? styleText("bold", node.name) : node.name;
			console.log(
				`${prefix}${connector}${name}  ${styleText(sizeColor(node.size), formatBytes(node.size))}`,
			);
		}
	}
}

/**
 * @param {string} dst
 * @param {string} content
 * @returns {Promise<void>}
 */
async function writeFile(dst, content) {
	const dir = path.dirname(dst);
	await fs.mkdir(dir, { recursive: true });
	await fs.writeFile(dst, content, "utf8");
	console.log("Writing", styleText("cyan", dst));
}

/**
 * @param {string} src
 * @param {string} dstDir
 * @returns {Promise<void>}
 */
async function copyFile(src, dstDir) {
	const dst = path.join(dstDir, path.basename(src));
	await fs.copyFile(src, dst);
	console.log(src, "->", styleText("cyan", dst));
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
 * @param {"cjs" | "es"} format
 * @returns {Promise<void>}
 */
async function bundle(format) {
	const { inputOptions, outputOptions } = getRollupConfig(format);
	const dir = outputOptions.dir;

	const name = { cjs: "CommonJS", es: "ESM" }[format];
	console.log(`Building ${name} bundle`);
	console.group("");

	const start = performance.now();
	const rollupBundle = await rollup(inputOptions);
	let result;
	try {
		result = await rollupBundle.write(outputOptions);
	} finally {
		await rollupBundle.close();
		console.groupEnd();
	}

	const elapsed = performance.now() - start;

	const files = result.output.filter((it) => !it.fileName.endsWith(".map"));
	console.log();
	console.log(styleText("cyan", `${dir}/`));
	printTree(buildTree(files));

	console.log();
	console.log(styleText("green", `Done in ${formatTime(elapsed)}`));
	console.log();
}

/**
 * @returns {Promise<void>}
 */
async function build() {
	const html5dts = [
		`declare const value: import("html-validate").MetaDataTable;\n`,
		`export default value;\n`,
	];

	await bundle("es");
	await bundle("cjs");
	await apiExtractor(["entrypoints/api-extractor-*.json"]);
	await writeFile("dist/types/html5.d.ts", html5dts.join(""));
	await copySchema();
}

try {
	await build();
} catch (err) {
	console.error(err);
	process.exitCode = 1;
}
