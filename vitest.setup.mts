import path from "node:path";
import { vi } from "vitest";

vi.mock("./src/vitest/worker/vitest-worker.ts?worker&url", () => {
	return {
		default: path.resolve(import.meta.dirname, "./temp/vitest-worker.mjs"),
	};
});
