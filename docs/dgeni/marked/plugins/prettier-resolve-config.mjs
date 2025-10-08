import { resolveConfig } from "prettier";
import { runAsWorker } from "synckit";

runAsWorker(async (...args) => {
	return resolveConfig(...args);
});
