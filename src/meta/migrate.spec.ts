import { describe, expect, it } from "@jest/globals";
import { type MetaData } from "./element";
import { type HtmlElementLike } from "./html-element-like";
import { migrateElement, patternToRegex } from "./migrate";

const mockNode: HtmlElementLike = {
	closest() {
		return null;
	},
	getAttribute() {
		return null;
	},
	hasAttribute() {
		return false;
	},
};

it("should not migrate up-to-date data", () => {
	expect.assertions(1);
	const src: MetaData = {
		attributes: {
			"my-attr": {
				enum: ["a", "b", "c"],
			},
		},
	};
	const result = migrateElement(src);
	expect(result.attributes).toEqual({
		"my-attr": {
			enum: ["a", "b", "c"],
		},
	});
});

it("should handle missing attributes", () => {
	expect.assertions(1);
	const src: MetaData = {
		deprecatedAttributes: ["foo"],
	};
	const result = migrateElement(src);
	expect(result.attributes).toEqual({
		foo: {
			deprecated: true,
		},
	});
});

describe("should migrate attributes", () => {
	it("enumerated list", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				"my-attr": ["a", "b", "c"],
			},
		};
		const result = migrateElement(src);
		expect(result.attributes).toEqual({
			"my-attr": {
				enum: ["a", "b", "c"],
			},
		});
	});

	it("boolean", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				"my-attr": [] as string[],
			},
		};
		const result = migrateElement(src);
		expect(result.attributes).toEqual({
			"my-attr": {
				boolean: true,
			},
		});
	});

	it("omit", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				"my-attr": ["", "a"],
			},
		};
		const result = migrateElement(src);
		expect(result.attributes).toEqual({
			"my-attr": {
				omit: true,
				enum: ["a"],
			},
		});
	});

	it("missing attribute", () => {
		expect.assertions(1);
		const src: MetaData = {};
		const result = migrateElement(src);
		expect(result.attributes).toEqual({});
	});

	it("null", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				"my-attr": null,
			},
		};
		const result = migrateElement(src);
		expect(result.attributes).toEqual({
			"my-attr": { delete: true },
		});
	});

	it("deprecated", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				bar: { enum: ["val"] },
				baz: ["val"],
			},
			deprecatedAttributes: ["foo", "bar", "baz"],
		};
		const result = migrateElement(src);
		expect(result.attributes).toEqual({
			foo: {
				deprecated: true,
			},
			bar: {
				deprecated: true,
				enum: ["val"],
			},
			baz: {
				deprecated: true,
				enum: ["val"],
			},
		});
	});

	it("required", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				bar: { enum: ["val"] },
				baz: ["val"],
			},
			requiredAttributes: ["foo", "bar", "baz"],
		};
		const result = migrateElement(src);
		expect(result.attributes).toEqual({
			foo: {
				required: true,
			},
			bar: {
				required: true,
				enum: ["val"],
			},
			baz: {
				required: true,
				enum: ["val"],
			},
		});
	});
});

describe("formAssociated", () => {
	it("should fill in missing formAssociated properties", () => {
		expect.assertions(1);
		const src: MetaData = {
			formAssociated: {},
		};
		const result = migrateElement(src);
		expect(result.formAssociated).toEqual({
			disablable: false,
			listed: false,
		});
	});

	it("should not add formAssoicated unless present", () => {
		expect.assertions(1);
		const src: MetaData = {};
		const result = migrateElement(src);
		expect(result.formAssociated).toBeUndefined();
	});
});

describe("templateRoot", () => {
	it("should set to false by default", () => {
		expect.assertions(1);
		const src: MetaData = {};
		const result = migrateElement(src);
		expect(result.templateRoot).toBe(false);
	});

	it("should retain original explicit value", () => {
		expect.assertions(2);
		const enabled: MetaData = { templateRoot: true };
		const disabled: MetaData = { templateRoot: false };
		expect(migrateElement(enabled).templateRoot).toBe(true);
		expect(migrateElement(disabled).templateRoot).toBe(false);
	});

	it("should default to false when value is invalid", () => {
		expect.assertions(1);
		const src = { templateRoot: "foobar" } as unknown as MetaData;
		const result = migrateElement(src);
		expect(result.templateRoot).toBe(false);
	});
});

describe("aria.implicitRole", () => {
	it("should normalize missing property", () => {
		expect.assertions(1);
		const src: MetaData = {};
		const result = migrateElement(src);
		const naming = result.aria.implicitRole(mockNode);
		expect(naming).toBeNull();
	});

	it("should normalize string property", () => {
		expect.assertions(1);
		const src: MetaData = {
			aria: {
				implicitRole: "presentation",
			},
		};
		const result = migrateElement(src);
		const naming = result.aria.implicitRole(mockNode);
		expect(naming).toBe("presentation");
	});

	it("should normalize callback property", () => {
		expect.assertions(1);
		const src: MetaData = {
			aria: {
				implicitRole() {
					return "generic";
				},
			},
		};
		const result = migrateElement(src);
		const naming = result.aria.implicitRole(mockNode);
		expect(naming).toBe("generic");
	});
});

describe("aria.named", () => {
	it("should normalize missing property", () => {
		expect.assertions(1);
		const src: MetaData = {};
		const result = migrateElement(src);
		const naming = result.aria.naming(mockNode);
		expect(naming).toBe("allowed");
	});

	it("should normalize string property", () => {
		expect.assertions(1);
		const src: MetaData = {
			aria: {
				naming: "prohibited",
			},
		};
		const result = migrateElement(src);
		const naming = result.aria.naming(mockNode);
		expect(naming).toBe("prohibited");
	});

	it("should normalize callback property", () => {
		expect.assertions(1);
		const src: MetaData = {
			aria: {
				naming() {
					return "prohibited";
				},
			},
		};
		const result = migrateElement(src);
		const naming = result.aria.naming(mockNode);
		expect(naming).toBe("prohibited");
	});
});

describe("patternToRegex", () => {
	it("should match the literal prefix before the wildcard", () => {
		expect.assertions(1);
		const re = patternToRegex("data-*");
		expect(re.test("data-foo")).toBeTruthy();
	});

	it("should not match when the prefix is absent", () => {
		expect.assertions(1);
		const re = patternToRegex("data-*");
		expect(re.test("foo")).toBe(false);
	});

	it("should require at least one character after the wildcard", () => {
		expect.assertions(1);
		const re = patternToRegex("data-*");
		expect(re.test("data-")).toBe(false);
	});

	it("should match case-insensitively", () => {
		expect.assertions(2);
		const re = patternToRegex("data-*");
		expect(re.test("DATA-foo")).toBeTruthy();
		expect(re.test("Data-FOO")).toBeTruthy();
	});

	it("should escape regex special characters in the literal parts", () => {
		expect.assertions(2);
		const re = patternToRegex("xml:*");
		expect(re.test("xml:lang")).toBeTruthy();
		expect(re.test("xmlXlang")).toBe(false);
	});

	it("should support multiple wildcards", () => {
		expect.assertions(2);
		const re = patternToRegex("*-*");
		expect(re.test("foo-bar")).toBeTruthy();
		expect(re.test("foo")).toBe(false);
	});

	it("should be anchored at the start", () => {
		expect.assertions(2);
		const re = patternToRegex("foo-*");
		expect(re.test("foo-bar")).toBeTruthy();
		expect(re.test("xfoo-bar")).toBe(false);
	});

	it("should be anchored at the end", () => {
		expect.assertions(2);
		const re = patternToRegex("*-bar");
		expect(re.test("foo-bar")).toBeTruthy();
		expect(re.test("foo-barx")).toBe(false);
	});

	it("should match a wildcard surrounded by literals", () => {
		expect.assertions(3);
		const re = patternToRegex("[*]");
		expect(re.test("[foo]")).toBeTruthy();
		expect(re.test("[foo")).toBe(false);
		expect(re.test("foo]")).toBe(false);
	});
});

describe("patternAttributes", () => {
	it("should be empty when no pattern keys are present", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				"my-attr": {},
			},
		};
		const result = migrateElement(src);
		expect(result.patternAttributes).toEqual([]);
	});

	it("should migrate a glob key into a pattern attribute", () => {
		expect.assertions(2);
		const src: MetaData = {
			attributes: {
				"data-*": {},
			},
		};
		const result = migrateElement(src);
		expect(result.patternAttributes).toHaveLength(1);
		expect(result.patternAttributes[0]).toEqual({
			pattern: "data-*",
			regexp: expect.any(RegExp),
		});
	});

	it("should not include glob keys in static attributes", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				id: {},
				"data-*": {},
			},
		};
		const result = migrateElement(src);
		expect(result.attributes).not.toHaveProperty("data-*");
	});

	it("should carry over attribute properties to the pattern entry", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				"on*": { enum: ["foo"] },
			},
		};
		const result = migrateElement(src);
		expect(result.patternAttributes[0]).toMatchObject({ enum: ["foo"] });
	});

	it("should mark pattern attribute for deletion when set to null", () => {
		expect.assertions(1);
		const src: MetaData = {
			attributes: {
				"data-*": null,
			},
		};
		const result = migrateElement(src);
		expect(result.patternAttributes).toEqual([
			{ pattern: "data-*", regexp: expect.any(RegExp), delete: true },
		]);
	});

	it("should match attribute names against the generated regex", () => {
		expect.assertions(2);
		const src: MetaData = {
			attributes: {
				"aria-*": {},
			},
		};
		const result = migrateElement(src);
		const { regexp: name } = result.patternAttributes[0];
		expect(name.test("aria-label")).toBeTruthy();
		expect(name.test("data-foo")).toBe(false);
	});
});
