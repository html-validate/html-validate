const { spawn } = require("node:child_process");
const { mkdtempSync, rmSync } = require("node:fs");
const { createServer } = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { build } = require("esbuild");

async function getFreePort() {
	const server = createServer();
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Unable to allocate a local CDP port");
	}
	await new Promise((resolve, reject) => {
		server.close((error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
	return address.port;
}

async function waitForChromeDevTools(chromeProcess, port) {
	let startupError;
	chromeProcess.once("error", (error) => {
		startupError = error;
	});
	const deadline = Date.now() + 15_000;
	while (Date.now() < deadline) {
		if (startupError) {
			throw startupError;
		}
		if (chromeProcess.exitCode !== null && chromeProcess.exitCode !== undefined) {
			throw new Error(`Chrome exited with code ${chromeProcess.exitCode}`);
		}
		try {
			const response = await fetch(`http://127.0.0.1:${port}/json/version`);
			if (response.ok) {
				return;
			}
		} catch {
			// The debugging port is not ready yet.
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	throw new Error("Timed out waiting for Chrome DevTools Protocol");
}

async function setup() {
	await build({
		entryPoints: ["src/jest/worker/jest-worker.ts"],
		bundle: true,
		format: "cjs",
		outfile: "temp/jest-worker.js",
		platform: "node",
		target: "node22",
		plugins: [
			{
				name: "html-validate:get-rule-url",
				setup(build) {
					/* stub get-rule-url.mjs as it only runs in ESM but we are targeting CommonJS */
					build.onLoad({ filter: /get-rule-url.mjs$/ }, () => {
						return {
							contents: [
								`export function getRuleUrl() {`,
								`    return "https://html-validate.org/rule-mock-url.html";`,
								`};`,
							].join("\n"),
							loader: "js",
						};
					});
				},
			},
		],
	});
	if (process.env.HTML_VALIDATE_CDP !== "1") {
		return;
	}
	const port = await getFreePort();
	const profileDir = mkdtempSync(path.join(os.tmpdir(), "html-validate-cdp-profile-"));
	const chromePath = process.env.CHROME_BIN ?? "/opt/google/chrome/chrome";
	const chromeProcess = spawn(
		chromePath,
		[
			"--headless=new",
			"--no-sandbox",
			"--disable-gpu",
			"--disable-dev-shm-usage",
			"--no-first-run",
			"--no-default-browser-check",
			`--remote-debugging-port=${port}`,
			`--user-data-dir=${profileDir}`,
			"about:blank",
		],
		{ stdio: "ignore" },
	);
	Reflect.set(globalThis, "__htmlValidateCdp", { chromeProcess, profileDir });
	try {
		await waitForChromeDevTools(chromeProcess, port);
		process.env.HTML_VALIDATE_CDP_PORT = String(port);
		process.env.HTML_VALIDATE_CDP_PROFILE_DIR = profileDir;
	} catch (error) {
		await new Promise((resolve) => {
			const forceKill = setTimeout(() => {
				chromeProcess.kill("SIGKILL");
				resolve();
			}, 2_000);
			if (
				chromeProcess.exitCode !== null ||
				chromeProcess.signalCode !== null ||
				!chromeProcess.kill("SIGTERM")
			) {
				clearTimeout(forceKill);
				resolve();
			} else {
				chromeProcess.once("exit", () => {
					clearTimeout(forceKill);
					resolve();
				});
			}
		});
		rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
		Reflect.deleteProperty(globalThis, "__htmlValidateCdp");
		throw error;
	}
}

module.exports = setup;
