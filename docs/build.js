const Dgeni = require("dgeni");

async function docs() {
	console.log("Building docs");
	try {
		const dgeni = new Dgeni([require("./dgeni")]);
		await dgeni.generate();
	} catch (err) {
		throw new Error("Dgeni failed to generate docs", { cause: err });
	}
}

async function build() {
	await docs();
}

if (require.main === module) {
	build().catch((err) => {
		console.error("Failed to build docs:", err);
		process.exitCode = 1;
	});
}

module.exports = { build };
