import fs from "node:fs/promises";
import autoprefixer from "autoprefixer";
import browserify from "browserify";
import cssnano from "cssnano";
import Dgeni from "dgeni";
import postcss from "postcss";
import sass from "sass";
import dgeniPackage from "./dgeni/index.js";

async function assets() {
	console.group("Copying assets");
	const copy = async (src, dst) => {
		console.log(src, "->", dst);
		await fs.cp(src, dst, { recursive: true });
	};
	await copy("docs/app/favicon.ico", "public/favicon.ico");
	await copy("node_modules/@fortawesome/fontawesome-free/webfonts", "public/assets/fonts");
	console.groupEnd();
	console.log();
}

async function scripts() {
	console.group("Running Browserify");
	const b = browserify("docs/app/index.js", {
		transform: [
			[
				"babelify",
				{
					presets: ["@babel/preset-env"],
				},
			],
		],
	});
	const buffer = await new Promise((resolve, reject) => {
		b.bundle((err, buf) => {
			if (err) {
				reject(err);
			} else {
				resolve(buf);
			}
		});
	});
	const dst = "public/assets/docs.js";
	await fs.writeFile(dst, buffer);
	console.log(dst, "written");
	console.groupEnd();
	console.log();
}

async function stylesheets() {
	console.group("Running Sass and PostCSS");
	const src = "docs/app/docs.scss";
	const dst = "public/assets/docs.min.css";
	const plugins = [autoprefixer(), cssnano()];
	const compiled = sass.compile(src, {
		loadPaths: [
			"node_modules/@fortawesome/fontawesome-free/scss",
			"node_modules/bootstrap-sass/assets/stylesheets/",
			"node_modules/highlight.js/scss/",
		],
	});
	const transformed = await postcss(plugins).process(compiled.css, { from: src, to: dst });
	await fs.writeFile(dst, transformed.css, "utf-8");
	console.log(dst, "written");
	console.groupEnd();
	console.log();
}

async function docs() {
	console.log("Running Dgeni");
	try {
		const dgeni = new Dgeni([dgeniPackage]);
		await dgeni.generate();
	} catch (err) {
		throw new Error("Dgeni failed to generate docs", { cause: err });
	}
	console.log();
}

async function build() {
	await fs.mkdir("public/assets/fonts", { recursive: true });
	await assets();
	await scripts();
	await stylesheets();
	await docs();
}

try {
	await build();
	console.log("Build successful");
} catch (err) {
	console.error("Failed to build docs:", err);
	process.exitCode = 1;
}
