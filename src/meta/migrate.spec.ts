import { migrateElement } from "./migrate";

it("should not migrate up-to-date data ", () => {
	expect.assertions(1);
	const src = {
		foo: {
			attributes: {
				"my-attr": {
					enum: ["a", "b", "c"],
				},
			},
		},
	};
	const result = migrateElement(src);
	expect(result.foo.attributes).toEqual({
		"my-attr": {
			enum: ["a", "b", "c"],
		},
	});
});

describe("should migrate attributes", () => {
	it("enumerated list", () => {
		expect.assertions(1);
		const src = {
			foo: {
				attributes: {
					"my-attr": ["a", "b", "c"],
				},
			},
		};
		const result = migrateElement(src);
		expect(result.foo.attributes).toEqual({
			"my-attr": {
				enum: ["a", "b", "c"],
			},
		});
	});

	it("boolean", () => {
		expect.assertions(1);
		const src = {
			foo: {
				attributes: {
					"my-attr": [] as string[],
				},
			},
		};
		const result = migrateElement(src);
		expect(result.foo.attributes).toEqual({
			"my-attr": {
				boolean: true,
			},
		});
	});

	it("omit", () => {
		expect.assertions(1);
		const src = {
			foo: {
				attributes: {
					"my-attr": ["", "a"],
				},
			},
		};
		const result = migrateElement(src);
		expect(result.foo.attributes).toEqual({
			"my-attr": {
				omit: true,
				enum: ["", "a"],
			},
		});
	});

	it("missing attribute", () => {
		expect.assertions(1);
		const src = {
			foo: {},
		};
		const result = migrateElement(src);
		expect(result.foo.attributes).toBeUndefined();
	});

	it("deprecated", () => {
		expect.assertions(2);
		const src = {
			foo: { deprecatedAttributes: ["my-attr"] },
			bar: { attributes: { "my-attr": {} }, deprecatedAttributes: ["my-attr"] },
		};
		const result = migrateElement(src);
		expect(result.foo.attributes).toEqual({
			"my-attr": {
				deprecated: true,
			},
		});
		expect(result.bar.attributes).toEqual({
			"my-attr": {
				deprecated: true,
			},
		});
	});

	it("required", () => {
		expect.assertions(2);
		const src = {
			foo: { requiredAttributes: ["my-attr"] },
			bar: { attributes: { "my-attr": {} }, requiredAttributes: ["my-attr"] },
		};
		const result = migrateElement(src);
		expect(result.foo.attributes).toEqual({
			"my-attr": {
				required: true,
			},
		});
		expect(result.bar.attributes).toEqual({
			"my-attr": {
				required: true,
			},
		});
	});
});
