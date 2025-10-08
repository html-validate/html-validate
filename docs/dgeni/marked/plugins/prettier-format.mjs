import { format } from "prettier";
import { runAsWorker } from "synckit";

runAsWorker(async (...args) => {
	return format(...args);
});
