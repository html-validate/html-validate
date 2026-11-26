import { describe, expect, it } from "@jest/globals";
import { MetaTable } from "../meta";

describe("permittedContent", () => {
	it("should allow a callback", () => {
		expect.assertions(1);
		const table = new MetaTable();
		expect(() => {
			table.loadFromObject({ element: { permittedContent: () => ["foo"] } });
		}).not.toThrow();
	});

	it("should allow string", () => {
		expect.assertions(1);
		const table = new MetaTable();
		expect(() => {
			table.loadFromObject({
				element: {
					permittedContent: ["foo"],
				},
			});
		}).not.toThrow();
	});

	it("should allow exclude", () => {
		expect.assertions(1);
		const table = new MetaTable();
		expect(() => {
			table.loadFromObject({
				element: {
					permittedContent: [{ exclude: "foo" }],
				},
			});
		}).not.toThrow();
	});

	it("should allow AND-joined array", () => {
		expect.assertions(1);
		const table = new MetaTable();
		expect(() => {
			table.loadFromObject({
				element: {
					permittedContent: [["foo", { exclude: "bar" }]],
				},
			});
		}).not.toThrow();
	});
});

describe("permittedDescendants", () => {
	it("should allow a callback", () => {
		expect.assertions(1);
		const table = new MetaTable();
		expect(() => {
			table.loadFromObject({ element: { permittedDescendants: () => ["foo"] } });
		}).not.toThrow();
	});

	it("should allow string", () => {
		expect.assertions(1);
		const table = new MetaTable();
		expect(() => {
			table.loadFromObject({
				element: {
					permittedDescendants: ["foo"],
				},
			});
		}).not.toThrow();
	});

	it("should allow exclude", () => {
		expect.assertions(1);
		const table = new MetaTable();
		expect(() => {
			table.loadFromObject({
				element: {
					permittedDescendants: [{ exclude: "foo" }],
				},
			});
		}).not.toThrow();
	});

	it("should allow AND-joined array", () => {
		expect.assertions(1);
		const table = new MetaTable();
		expect(() => {
			table.loadFromObject({
				element: {
					permittedDescendants: [["foo", { exclude: "bar" }]],
				},
			});
		}).not.toThrow();
	});
});
