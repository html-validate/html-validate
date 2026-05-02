/* eslint-disable no-console -- expected to log */

import { performance } from "node:perf_hooks";
import { styleText } from "node:util";
import { Config, Parser } from "../dist/esm/index.js";

const DURATION_MS = 15000;

/**
 * Deterministic PRNG (xorshift32) with a fixed seed.
 * Returns values in [0, 1).
 */
function createRng(seed: number): () => number {
	let state = seed >>> 0;
	return function () {
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;
		return (state >>> 0) / 0x100000000;
	};
}

interface RunResult {
	pass: boolean;
}

interface Scenario<TContext = unknown> {
	name: string;
	description: string;
	setup(parser: Parser): TContext;
	run(context: TContext, rng: () => number): RunResult;
}

function defineScenario<TContext>(scenario: Scenario<TContext>): Scenario<TContext> {
	return scenario;
}

const scenarios = [
	defineScenario({
		name: "#id selector (flat)",
		description: "Flat document with a single `<div>` containing 500 `<span>` siblings",
		setup(parser) {
			const count = 500;
			const ids = Array.from({ length: count }, (_, i) => `item-${i}`);
			const spans = ids.map((id) => `<span id="${id}"></span>`).join("");
			const markup = `<div>${spans}</div>`;
			const document = parser.parseHtml(markup);
			return { document, ids };
		},
		run(context, rng) {
			const { document, ids } = context;
			const index = Math.floor(rng() * ids.length);
			const id = ids[index];
			const el = document.querySelector(`#${id}`);
			return { pass: el?.id === id };
		},
	}),
	defineScenario({
		name: "#id selector (deep)",
		description: "Deeply nested document with 500 `<div>` elements wrapping each other",
		setup(parser) {
			const count = 500;
			const ids = Array.from({ length: count }, (_, i) => `item-${i}`);
			const markup = ids.reduceRight((inner, id) => `<div id="${id}">${inner}</div>`, "");
			const document = parser.parseHtml(markup);
			return { document, ids };
		},
		run(context, rng) {
			const { document, ids } = context;
			const index = Math.floor(rng() * ids.length);
			const id = ids[index];
			const el = document.querySelector(`#${id}`);
			return { pass: el?.id === id };
		},
	}),
];

const isTTY = process.stdout.isTTY === true;

async function runScenario(
	scenario: Scenario,
	parser: Parser,
): Promise<{ ops: number; failures: number }> {
	const context = scenario.setup(parser);
	/* seed is fixed so the same sequence of selectors is used on every run */
	const rng = createRng(0xdeadbeef);

	let ops = 0;
	let failures = 0;

	const start = performance.now();
	const deadline = start + DURATION_MS;
	let nextTick = start + 1000;

	while (true) {
		const now = performance.now();
		if (now >= deadline) {
			break;
		}

		if (isTTY && now >= nextTick) {
			nextTick += 1000;
			const elapsed = Math.round(now - start);
			const opsPerSec = Math.round((ops / elapsed) * 1000);
			process.stdout.clearLine(0);
			process.stdout.cursorTo(0);
			process.stdout.write(
				`${scenario.name} ... ${ops.toLocaleString()} ops (${opsPerSec.toLocaleString()} ops/sec) [${Math.round(elapsed / 1000)}s / ${DURATION_MS / 1000}s]`,
			);
		}

		const { pass } = scenario.run(context, rng);
		ops++;
		if (!pass) {
			failures++;
		}
	}

	if (isTTY) {
		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
	}

	return { ops, failures };
}

async function main(): Promise<void> {
	const resolvedConfig = await Config.empty().resolve();
	const parser = new Parser(resolvedConfig);

	let anyFailures = false;

	for (const scenario of scenarios) {
		if (!isTTY) {
			process.stdout.write(`${scenario.name} ... `);
		}

		const { ops, failures } = await runScenario(scenario, parser);
		const opsPerSec = Math.round((ops / DURATION_MS) * 1000);
		const prefix = isTTY ? `${scenario.name} ... ` : "";

		if (failures > 0) {
			anyFailures = true;
			const failureMsg = `FAILED (${failures}/${ops} ops failed) — one or more selectors did not return the expected results`;
			console.log(`${prefix}${styleText("red", failureMsg)}`);
		} else {
			console.log(
				`${prefix}${styleText("green", "OK")} ${ops.toLocaleString()} ops in ${DURATION_MS / 1000}s (${opsPerSec.toLocaleString()} ops/sec)`,
			);
		}
	}

	if (anyFailures) {
		process.exitCode = 1;
	}
}

try {
	await main();
} catch (err) {
	console.error(styleText("red", String(err)));
	process.exitCode = 1;
}
