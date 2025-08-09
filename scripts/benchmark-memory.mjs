/* eslint-disable no-console -- expected to log */

/* eslint-disable-next-line n/no-unsupported-features/node-builtins -- developer script */
import { styleText } from "node:util";
import babar from "babar";
import Table from "cli-table";
import { CLI } from "../dist/esm/index.js";

async function iteration() {
	if (global.gc) {
		global.gc();
	}

	const cli = new CLI();
	const htmlValidate = await cli.getValidator();
	await htmlValidate.validateString("<!DOCTYPE html><html><head></head><body></body></html>");
}

function prettySize(value) {
	if (value > 1024 * 1024) {
		return `${(value / 1024 / 1024).toFixed(1)}mb`;
	} else if (value > 1024) {
		return `${Math.round((value / 1024) * 10) / 10}kb`;
	} else {
		return `${value}`;
	}
}

function percent(cur, prev) {
	const k = cur / prev;
	const p = (k - 1) * 1000;
	return p > 0 ? Math.floor(p) / 10 : Math.ceil(p) / 10;
}

if (global.gc) {
	console.log(styleText("red", "⚠ Running with garbage collection"));
	console.log(styleText("red", "  Remove --expose-gc from node options to run without"));
} else {
	console.log(styleText("green", "✓ Running without garbage collection"));
}

const numCycles = process.argv.length > 2 ? Number(process.argv[2]) : 25000;
const bucketSize = Math.floor(numCycles / 10);
const journal = [];
for (let cycle = 0; cycle <= numCycles; cycle++) {
	await iteration();
	const { heapTotal, heapUsed } = process.memoryUsage();
	if (cycle % bucketSize === 0) {
		const previousTotal = journal.length > 0 ? journal[journal.length - 1].heapTotal : heapTotal;
		const previousUsed = journal.length > 0 ? journal[journal.length - 1].heapUsed : heapUsed;
		journal.push({
			cycle,
			heapUsed,
			heapTotal,
			"heapTotal (mb)": `${(heapTotal / 1024 ** 2).toFixed(1)}mb`,
			"heapTotal (%)": `${percent(heapTotal, previousTotal)}%`,
			"heapUsed (mb)": `${(heapUsed / 1024 ** 2).toFixed(1)}mb`,
			"heapUsed (%)": `${percent(heapUsed, previousUsed)}%`,
		});
	}
	process.stdout.clearLine(0);
	process.stdout.cursorTo(0);
	process.stdout.write(
		`${cycle} / ${numCycles} iterations done, ${prettySize(heapUsed)} heap used, ${prettySize(heapTotal)} heap total`,
	);
}
process.stdout.write("\n");
const table = new Table({
	head: ["Bucket", "Used (mb)", "Used (%)", "Total (mb)", "Total (%)"],
	colAligns: ["right", "right", "right", "right", "right"],
	style: { head: ["cyan"], compact: true },
});
table.push(
	...journal.map((it, index) => {
		return [
			index,
			it["heapUsed (mb)"],
			it["heapUsed (%)"],
			it["heapTotal (mb)"],
			it["heapTotal (%)"],
		];
	}),
);
console.log("Heap profile");
console.log(table.toString());

const values = journal.map((it) => it.heapTotal);
console.log(
	"min:",
	(Math.min(...values) / 1024 ** 2).toFixed(1),
	"max:",
	(Math.max(...values) / 1024 ** 2).toFixed(1),
);

const heapTotal = journal.map((it, i) => [i, it.heapTotal / 1024 ** 2]);
const chartTotal = babar(heapTotal, {
	caption: "Heap total (MB per 100 runs)",
	color: "green",
	width: 60,
	height: 20,
	minY: 0,
	yFractions: 0,
});
console.log(chartTotal);

const heapUsed = journal.map((it, i) => [i, it.heapUsed / 1024 ** 2]);
const chartUsed = babar(heapUsed, {
	caption: "Heap used (MB per 100 runs)",
	color: "green",
	width: 60,
	height: 20,
	minY: 0,
	yFractions: 0,
});
console.log(chartUsed);
