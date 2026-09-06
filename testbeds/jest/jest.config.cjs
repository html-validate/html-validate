module.exports = {
	testEnvironment: "node",
	testMatch: ["<rootDir>/*.spec.ts"],
	/*
	 * jest-environment-jsdom defaults to `customExportConditions: ["browser"]`
	 * which would otherwise make node_modules resolution of the packed
	 * "html-validate" package (and its dependencies) favor their browser
	 * builds (e.g. missing the CLI export). These tests exercise the regular
	 * Node.js build, so force the "node" condition instead, for both the
	 * default (node) test environment and any per-file jsdom override.
	 */
	testEnvironmentOptions: {
		customExportConditions: ["node"],
	},
	transform: {
		/*
		 * Diagnostics/typechecking is intentionally disabled here: this testbed
		 * only exercises runtime behavior of the jest matchers against a given
		 * major version of jest. Full type-checking of tests/jest is already
		 * covered by the regular test suite, and ts-jest does not reliably merge
		 * declaration-merged ambient types (e.g. the "expect"/"jest" matcher
		 * augmentations) coming from a package resolved through node_modules
		 * across every supported jest/ts-jest/typescript combination.
		 */
		"^.+\\.ts$": ["ts-jest"],
	},
};
