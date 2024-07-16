import { runAsWorker } from "synckit";
import { format } from "prettier";

runAsWorker(async (...args) => {
	return format(...args);
});
