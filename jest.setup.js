/* this file is precompiled from jest.setup.js */
jest.mock(
	"./src/jest/worker/worker.ts?worker&url",
	() => require.resolve("./temp/jest-worker.js"),
	{ virtual: true },
);
