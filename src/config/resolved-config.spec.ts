import { getAriaData } from "@html-validate/w3c-data/aria";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MetaTable } from "../meta";
import { type AriaVersion } from "./aria-version";
import { type ResolvedConfigData, ResolvedConfig } from "./resolved-config";

function createMockConfig(config: Partial<ResolvedConfigData> = {}): ResolvedConfig {
	const metaTable = new MetaTable();
	const defaults: ResolvedConfigData = {
		metaTable,
		plugins: [],
		rules: new Map(),
		transformers: [],
		ariaVersion: "1.2",
	};
	return new ResolvedConfig({ ...defaults, ...config }, {});
}

beforeEach(() => {
	jest.restoreAllMocks();
});

describe("canTransform()", () => {
	let config: ResolvedConfig;

	beforeEach(() => {
		config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "mock-transform" }],
		});
	});

	it("should return true if a transformer can handle the file", () => {
		expect.assertions(1);
		expect(config.canTransform("my-file.foo")).toBeTruthy();
	});

	it("should return false if no transformer can handle the file", () => {
		expect.assertions(1);
		expect(config.canTransform("my-file.bar")).toBeFalsy();
	});
});

describe("getAriaVersion()", () => {
	it("should return the configured ARIA version", () => {
		expect.assertions(1);
		const config = createMockConfig({ ariaVersion: "1.3" });
		expect(config.getAriaVersion()).toBe("1.3");
	});
});

describe("getAriaData()", () => {
	it.each<AriaVersion>(["1.2", "1.3", "latest"])(
		"should return ARIA data for version %s",
		(ariaVersion) => {
			expect.assertions(3);
			const config = createMockConfig({ ariaVersion });
			const data = config.getAriaData();
			expect(data).toBe(getAriaData(ariaVersion));
			expect(config.getAriaData()).toBe(data);
			expect(data.getRoleData("alert")).toEqual(expect.objectContaining({ role: "alert" }));
		},
	);
});
