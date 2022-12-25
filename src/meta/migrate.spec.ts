import { MetaData } from "./element";
import { migrateElement } from "./migrate";

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
