const fs = require("node:fs").promises;
const path = require("node:path");
const pkg = require("../package.json");

async function generatePackageTs() {
	const dst = path.relative(process.cwd(), path.join(__dirname, "../src/generated/package.ts"));
	const content = `
/* generated file, changes will be overwritten */
/** @public */
export const name: string = "${pkg.name}";
/** @public */
export const version: string = "${pkg.version}";
/** @public */
export const homepage: string = "${pkg.homepage}";
/** @public */
export const bugs: string = "${pkg.bugs.url}";
`.trimStart();
	await fs.mkdir(path.dirname(dst), { recursive: true });
	await fs.writeFile(dst, content, "utf-8");
	/* eslint-disable-next-line no-console -- CLI script, expected output */
	console.log("Generating", dst);
}

(async () => {
	await generatePackageTs();
})();
