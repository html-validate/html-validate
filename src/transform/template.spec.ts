import { TemplateExtractor } from "./template";

describe("TemplateExtractor", () => {
	describe("extractObjectProperty()", () => {
		it("should extract templates from object property", () => {
			const te = TemplateExtractor.fromString('foo({template: "<b>foo</b>"})');
			expect(te.extractObjectProperty("template")).toEqual([
				{
					data: "<b>foo</b>",
					filename: "inline",
					line: 1,
					column: 16,
					offset: 16,
				},
			]);
		});

		it("should handle literal", () => {
			const te = TemplateExtractor.fromString(
				'foo({"template": "<b>foo</b>"})'
			);
			expect(te.extractObjectProperty("template")).toEqual([
				{
					data: "<b>foo</b>",
					filename: "inline",
					line: 1,
					column: 18,
					offset: 18,
				},
			]);
		});

		it.each`
			type            | value
			${"null"}       | ${null}
			${"undefined"}  | ${undefined}
			${"boolean"}    | ${true}
			${"number"}     | ${12}
			${"regexp"}     | ${/foo/}
			${"identifier"} | ${"foo"}
		`("should ignore $type value", ({ value }) => {
			const te = TemplateExtractor.fromString(`foo({"template": ${value}})`);
			expect(te.extractObjectProperty("template")).toEqual([]);
		});

		it("should ignore other properties", () => {
			const te = TemplateExtractor.fromString('foo({bar: "<b>foo</b>"})');
			expect(te.extractObjectProperty("template")).toEqual([]);
		});

		it("should handle single quotes", () => {
			const te = TemplateExtractor.fromString("foo({template: '<b>foo</b>'})");
			expect(te.extractObjectProperty("template")).toEqual([
				{
					data: "<b>foo</b>",
					filename: "inline",
					line: 1,
					column: 16,
					offset: 16,
				},
			]);
		});

		it("should handle double quotes", () => {
			const te = TemplateExtractor.fromString('foo({template: "<b>foo</b>"})');
			expect(te.extractObjectProperty("template")).toEqual([
				{
					data: "<b>foo</b>",
					filename: "inline",
					line: 1,
					column: 16,
					offset: 16,
				},
			]);
		});

		it("should handle template literal", () => {
			const te = TemplateExtractor.fromString(
				"foo({template: `<b>${foo}</b>`})"
			);
			expect(te.extractObjectProperty("template")).toEqual([
				{
					data: "<b>      </b>",
					filename: "inline",
					line: 1,
					column: 16,
					offset: 16,
				},
			]);
		});

		it("should handle tagged template", () => {
			const te = TemplateExtractor.fromString(
				"foo({template: foo`<b>${foo}</b>`})"
			);
			expect(te.extractObjectProperty("template")).toEqual([
				{
					data: "<b>      </b>",
					filename: "inline",
					line: 1,
					column: 19,
					offset: 19,
				},
			]);
		});

		it("should extract templates from arrow function returning template", () => {
			const te = TemplateExtractor.fromString(
				"foo({template: (foo) => `<b>${foo}</b>`})"
			);
			expect(te.extractObjectProperty("template")).toEqual([
				{
					data: "<b>      </b>",
					filename: "inline",
					line: 1,
					column: 25,
					offset: 25,
				},
			]);
		});

		/* ignored because it is deemed to difficult to figure out the actual return value (i.e. the user can do too complex things) */
		it("should ignore arrow function width function body", () => {
			const te = TemplateExtractor.fromString(
				"foo({template: (foo) => { return `<b>${foo}</b>`; }})"
			);
			expect(te.extractObjectProperty("template")).toEqual([]);
		});

		/* ignored because it is deemed to difficult to figure out the actual return value (i.e. the user can do too complex things) */
		it("should ignore regular function", () => {
			const te = TemplateExtractor.fromString(
				"foo({template: function(foo){ return `<b>${foo}</b>`; }})"
			);
			expect(te.extractObjectProperty("template")).toEqual([]);
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
				offset: 53,
			},
			{
				data: "<b>foo</b>",
				filename: "test-files/extract.js",
				line: 6,
				column: 12,
				offset: 113,
			},
			{
				data: "<p>foo</p>",
				filename: "test-files/extract.js",
				line: 10,
				column: 12,
				offset: 165,
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
				offset: 0,
			},
		]);
	});
});
