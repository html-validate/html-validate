import { runAsWorker } from "synckit";
import { resolveConfig } from "prettier";

runAsWorker(async (...args) => {
	return resolveConfig(...args);
});
