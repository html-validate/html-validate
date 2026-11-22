const { rmSync } = require("node:fs");

module.exports = async function teardown() {
	const cdp = Reflect.get(globalThis, "__htmlValidateCdp");
	if (!cdp) {
		return;
	}
	const { chromeProcess, profileDir } = cdp;
	if (chromeProcess.exitCode === null && chromeProcess.signalCode === null) {
		const exited = new Promise((resolve) => {
			chromeProcess.once("exit", resolve);
		});
		chromeProcess.kill("SIGTERM");
		const forceKill = setTimeout(() => {
			chromeProcess.kill("SIGKILL");
		}, 2_000);
		await exited;
		clearTimeout(forceKill);
	}
	rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
	delete process.env.HTML_VALIDATE_CDP_PORT;
	delete process.env.HTML_VALIDATE_CDP_PROFILE_DIR;
};
