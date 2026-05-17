import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["**/*.vitest.ts"],
		globalSetup: "vitest.global.ts",
		setupFiles: "vitest.setup.ts",
	},
});
