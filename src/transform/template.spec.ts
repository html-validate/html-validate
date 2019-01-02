import { TemplateExtractor } from "./template";

describe("TemplateExtractor", () => {
	describe("extractObjectProperty()", () => {
		it("should extract templates from object property", () => {
			const te = TemplateExtractor.fromString('foo({template: "<b>foo</b>"})');
			expect(te.extractObjectProperty("template")).toEqual([
				{ data: "<b>foo</b>", filename: "inline", line: 1, column: 16 },
			]);
		});

		it("should ignore other properties", () => {
			const te = TemplateExtractor.fromString('foo({bar: "<b>foo</b>"})');
			expect(te.extractObjectProperty("template")).toEqual([]);
		});

		it("should handle single quotes", () => {
			const te = TemplateExtractor.fromString("foo({template: '<b>foo</b>'})");
			expect(te.extractObjectProperty("template")).toEqual([
				{ data: "<b>foo</b>", filename: "inline", line: 1, column: 16 },
			]);
		});

		it("should handle double quotes", () => {
			const te = TemplateExtractor.fromString('foo({template: "<b>foo</b>"})');
			expect(te.extractObjectProperty("template")).toEqual([
				{ data: "<b>foo</b>", filename: "inline", line: 1, column: 16 },
			]);
		});

		it("should handle template literal", () => {
			const te = TemplateExtractor.fromString(
				"foo({template: `<b>${foo}</b>`})"
			);
			expect(te.extractObjectProperty("template")).toEqual([
				{ data: "<b>      </b>", filename: "inline", line: 1, column: 16 },
			]);
		});

		it("should handle tagged template", () => {
			const te = TemplateExtractor.fromString(
				"foo({template: foo`<b>${foo}</b>`})"
			);
			expect(te.extractObjectProperty("template")).toEqual([
				{ data: "<b>      </b>", filename: "inline", line: 1, column: 19 },
			]);
		});
	});

	it("should extract from file", () => {
		const te = TemplateExtractor.fromFilename("test-files/extract.js");
		expect(te.extractObjectProperty("template")).toEqual([
			{
				data: "<p>foo</i>",
				filename: "test-files/extract.js",
				line: 2,
				column: 12,
			},
			{
				data: "<b>foo</b>",
				filename: "test-files/extract.js",
				line: 6,
				column: 12,
			},
			{
				data: "<p>foo</p>",
				filename: "test-files/extract.js",
				line: 10,
				column: 12,
			},
		]);
	});

	it("createSource() should create source from file as-is", () => {
		expect(TemplateExtractor.createSource("test-files/extract.js")).toEqual([
			{
				data: expect.any(String),
				filename: "test-files/extract.js",
				line: 1,
				column: 1,
			},
		]);
	});
});
