import { vol } from "memfs";

jest.mock("node:fs", () => require("memfs").fs);

import { readCache, writeCache } from "./gitlab-api.mjs";

const CACHE_PATH = "/test-cache/roadmap.json";

beforeEach(() => {
	vol.reset();
});

describe("readCache", () => {
	it("should return null when the cache file does not exist", () => {
		expect.assertions(1);
		expect(readCache(CACHE_PATH)).toBeNull();
	});

	it("should return null when the cache has expired", () => {
		expect.assertions(1);
		const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
		vol.fromJSON({
			[CACHE_PATH]: JSON.stringify({ timestamp: twoHoursAgo, epics: [{ iid: "1" }] }),
		});
		expect(readCache(CACHE_PATH)).toBeNull();
	});

	it("should return epics when the cache is fresh", () => {
		expect.assertions(1);
		const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
		const epics = [{ iid: "1", title: "Epic 1" }];
		vol.fromJSON({ [CACHE_PATH]: JSON.stringify({ timestamp: fiveMinutesAgo, epics }) });
		expect(readCache(CACHE_PATH)).toEqual(epics);
	});

	it("should return null when the cache file contains invalid JSON", () => {
		expect.assertions(1);
		vol.fromJSON({ [CACHE_PATH]: "not valid json" });
		expect(readCache(CACHE_PATH)).toBeNull();
	});
});

describe("writeCache", () => {
	it("should write the cache file", () => {
		expect.assertions(1);
		writeCache(CACHE_PATH, []);
		expect(vol.existsSync(CACHE_PATH)).toBe(true);
	});

	it("should include epics in the written data", () => {
		expect.assertions(1);
		const epics = [{ iid: "2", title: "My Epic" }];
		writeCache(CACHE_PATH, epics);
		const written = JSON.parse(vol.readFileSync(CACHE_PATH, "utf-8"));
		expect(written.epics).toEqual(epics);
	});

	it("should include a current timestamp in the written data", () => {
		expect.assertions(2);
		const before = Date.now();
		writeCache(CACHE_PATH, []);
		const after = Date.now();
		const written = JSON.parse(vol.readFileSync(CACHE_PATH, "utf-8"));
		expect(written.timestamp).toBeGreaterThanOrEqual(before);
		expect(written.timestamp).toBeLessThanOrEqual(after);
	});
});
