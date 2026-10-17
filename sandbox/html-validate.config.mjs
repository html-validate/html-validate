import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { defineFlatConfig } from "html-validate";
import html5 from "html-validate/elements/html5";
import { recommended } from "html-validate/presets";

const configPath = path.resolve(import.meta.dirname, "html-validate.local.mjs");

async function loadLocalConfig() {
	if (!fs.existsSync(configPath)) {
		return [];
	}
	const { default: local } = await import(pathToFileURL(configPath).href);
	return Array.isArray(local) ? local : [local];
}

export default defineFlatConfig([
	{
		name: "sandbox/base",
		files: ["*.html"],
		elements: [html5],
		...recommended,
	},
	...(await loadLocalConfig()),
]);
