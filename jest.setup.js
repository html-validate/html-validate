/* this file is precompiled from jest.setup.js */
jest.mock(
	"./src/jest/worker/worker.ts?worker&url",
	() => require.resolve("./temp/jest-worker.js"),
	{ virtual: true },
);

/* Workaround for jest not supporting `import(..)` yet ans ts-jest compiles
 * `import(..)` to `require(..)` anyway, the issue is that a
 * `file:///path/to/file?mtime=123456789` url is passed which `require(..)` will
 * choke on so we convert this to a regular path and passes it back to the
 * original function. */
jest.mock("./src/config/resolver/nodejs/import-function", () => {
	const { fileURLToPath } = require("node:url");
	const { importFunction: originalFn } = jest.requireActual(
		"./src/config/resolver/nodejs/import-function",
	);
	return {
		importFunction: jest.fn((id) => {
			return originalFn(fileURLToPath(id));
		}),
	};
});
