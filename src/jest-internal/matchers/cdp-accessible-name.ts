/*
 * Opt-in CDP checks: run `HTML_VALIDATE_CDP=1 npx jest <test-file>`.
 * Set CHROME_BIN if Chrome is not at /opt/google/chrome/chrome.
 */

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll } from "@jest/globals";
import cdpApi from "chrome-remote-interface";
import { type MatcherContext, type SyncExpectationResult } from "expect";

type CdpClient = Awaited<ReturnType<typeof cdpApi>>;

declare module "expect" {
	interface Matchers<R extends void | Promise<void>, T = unknown> {
		/**
		 * Compare an expected accessible name with Chrome's computed name, using Chrome as an
		 * independent oracle to verify assumptions about accessible-name computation.
		 *
		 * CDP checks are opt-in. Enable them by setting `HTML_VALIDATE_CDP=1` when running Jest:
		 * `env HTML_VALIDATE_CDP=1 npx jest <test-file>`.
		 *
		 * @internal
		 */
		cdpAccessibleName(
			selector: string,
			expectedName: string,
		): T extends string ? Promise<R> : never;
	}
}

const CDP_ENABLED = process.env["HTML_VALIDATE_CDP"] === "1";
const cdpState: {
	client?: CdpClient;
	port?: number;
	targetId?: string;
	profileDir?: string;
	operationQueue: Promise<void>;
} = { operationQueue: Promise.resolve() };

function isDynamicMarkup(markup: string): boolean {
	const DYNAMIC_ATTRIBUTE_PATTERN = /\b(?:dynamic-[\w-]+|bind-[\w-]+)\s*=/i;
	const TEMPLATE_ATTRIBUTE_PATTERN = /\s:[\w-]+\s*=|\bv-bind:[\w-]+\s*=/i;
	const TEMPLATE_INTERPOLATION_PATTERN = /\{\{|\$\{/;
	return (
		DYNAMIC_ATTRIBUTE_PATTERN.test(markup) ||
		TEMPLATE_ATTRIBUTE_PATTERN.test(markup) ||
		TEMPLATE_INTERPOLATION_PATTERN.test(markup)
	);
}

async function connectCdpBrowser(): Promise<void> {
	const port = Number(process.env["HTML_VALIDATE_CDP_PORT"]);
	const profileDir = process.env["HTML_VALIDATE_CDP_PROFILE_DIR"];
	if (!Number.isSafeInteger(port) || !profileDir) {
		throw new Error("CDP browser was not initialized by Jest global setup");
	}
	const createTarget = cdpApi.New.bind(cdpApi);
	const { id: targetId } = await createTarget({ host: "127.0.0.1", port, url: "about:blank" });
	const client = await cdpApi({ host: "127.0.0.1", port, target: targetId });
	cdpState.port = port;
	cdpState.profileDir = profileDir;
	cdpState.targetId = targetId;
	cdpState.client = client;
	await Promise.all([
		client.Accessibility.enable(),
		client.DOM.enable(),
		client.Page.enable(),
		client.Runtime.enable(),
	]);
}

function getFixturePath(
	markup: string,
	profileDir: string,
	test: { testPath?: string; currentTestName?: string },
): string {
	const { testPath = "", currentTestName = "" } = test;
	const markupHash = createHash("sha256")
		.update(markup)
		.update(testPath)
		.update(currentTestName)
		.digest("hex");
	return path.join(profileDir, `fixture-${markupHash}.html`);
}

async function getCdpAccessibleName(
	markup: string,
	selector: string,
	test: {
		testPath?: string;
		currentTestName?: string;
	},
): Promise<string> {
	// eslint-disable-next-line unicorn/prefer-await -- Promise chaining serializes shared CDP target operations.
	const operation = cdpState.operationQueue.then(() => {
		return readCdpAccessibleName(markup, selector, test);
	});
	// eslint-disable-next-line unicorn/prefer-await -- Keep the queue available after either outcome.
	cdpState.operationQueue = operation.then(() => undefined).catch(() => undefined);
	return operation;
}

async function readCdpAccessibleName(
	markup: string,
	selector: string,
	test: {
		testPath?: string;
		currentTestName?: string;
	},
): Promise<string> {
	const { client, profileDir } = cdpState;
	if (!client || !profileDir) {
		throw new Error("CDP browser is not available");
	}

	const fixturePath = getFixturePath(markup, profileDir, test);
	await fs.writeFile(fixturePath, `<!doctype html><meta charset="utf-8">${markup}`);
	try {
		const navigation = await client.Page.navigate({ url: pathToFileURL(fixturePath).href });
		if (navigation.errorText) {
			throw new Error(navigation.errorText);
		}
		await client.Runtime.evaluate({
			expression:
				"new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
			awaitPromise: true,
			returnByValue: true,
		});
		const { root } = await client.DOM.getDocument({ depth: -1 });
		const { nodeId } = await client.DOM.querySelector({ nodeId: root.nodeId, selector });
		if (!nodeId) {
			throw new Error(`CDP selector did not match: ${selector}`);
		}
		const { node } = await client.DOM.describeNode({ nodeId });
		const { nodes: partialNodes } = await client.Accessibility.getPartialAXTree({
			nodeId,
			fetchRelatives: true,
		});
		let axNode = partialNodes.find(
			(candidate) => candidate.backendDOMNodeId === node.backendNodeId,
		);
		if (!axNode) {
			const { nodes: fullNodes } = await client.Accessibility.getFullAXTree();
			axNode = fullNodes.find((candidate) => candidate.backendDOMNodeId === node.backendNodeId);
		}
		const name: unknown = axNode?.name?.value;
		return typeof name === "string" ? name : "";
	} finally {
		await fs.unlink(fixturePath);
	}
}

export async function cdpAccessibleName(
	this: MatcherContext,
	markup: unknown,
	selector: string,
	expectedName: string,
): Promise<SyncExpectationResult> {
	if (typeof markup !== "string") {
		return {
			pass: false,
			message: () => "CDP assertion expects markup to be a string",
		};
	}
	if (!CDP_ENABLED) {
		return {
			pass: true,
			message: () => "CDP assertion disabled; set HTML_VALIDATE_CDP=1 to enable",
		};
	}
	if (isDynamicMarkup(markup)) {
		return { pass: true, message: () => "CDP assertion skipped for dynamic or template markup" };
	}
	const actualName = await getCdpAccessibleName(markup, selector, this);
	return {
		pass: actualName === expectedName,
		message: () =>
			`Expected Chrome accessible name ${JSON.stringify(expectedName)}, received ${JSON.stringify(actualName)} for ${selector}`,
	};
}

beforeAll(async () => {
	if (CDP_ENABLED) {
		await connectCdpBrowser();
	}
}, 30_000);

afterAll(async () => {
	await cdpState.client?.close();
	const { port, targetId } = cdpState;
	if (port === undefined || !targetId) {
		return;
	}
	const closeTarget = cdpApi.Close.bind(cdpApi);
	await closeTarget({ host: "127.0.0.1", port, id: targetId });
});
