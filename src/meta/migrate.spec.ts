import { type MetaData } from "./element";
import { type HtmlElementLike } from "./html-element-like";
import { migrateElement } from "./migrate";

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

	it("should migrate deprecated implicitRole", () => {
		expect.assertions(1);
		const src: MetaData = {
			implicitRole() {
				return "button";
			},
		};
		const result = migrateElement(src);
		const naming = result.aria.implicitRole(mockNode);
		expect(naming).toBe("button");
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
