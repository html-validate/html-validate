const fs = require("node:fs/promises");
const browserify = require("browserify");
const Dgeni = require("dgeni");

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

async function docs() {
	console.log("Running Dgeni");
	try {
		const dgeni = new Dgeni([require("./dgeni")]);
		await dgeni.generate();
	} catch (err) {
		throw new Error("Dgeni failed to generate docs", { cause: err });
	}
	console.log();
}

async function build() {
	await scripts();
	await docs();
}

if (require.main === module) {
	build()
		.then(() => {
			console.log("Build successful");
		})
		.catch((err) => {
			console.error("Failed to build docs:", err);
			process.exitCode = 1;
		});
}

module.exports = { build };
