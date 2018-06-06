import { TemplateExtractor } from './template';

describe('TemplateExtractor', function(){

	const expect = require('chai').expect;

	describe('extractObjectProperty()', () => {

		it('should extract templates from object property', () => {
			const te = TemplateExtractor.fromString('foo({template: "<b>foo</b>"})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				'<b>foo</b>',
			]);
		});

		it('should handle single quotes', () => {
			const te = TemplateExtractor.fromString('foo({template: \'<b>foo</b>\'})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				'<b>foo</b>',
			]);
		});

		it('should handle double quotes', () => {
			const te = TemplateExtractor.fromString('foo({template: "<b>foo</b>"})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				'<b>foo</b>',
			]);
		});

		it('should handle template literal', () => {
			const te = TemplateExtractor.fromString('foo({template: `<b>foo</b>`})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				'<b>foo</b>',
			]);
		});

		it('should handle tagged template', () => {
			const te = TemplateExtractor.fromString('foo({template: foo`<b>foo</b>`})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				'<b>foo</b>',
			]);
		});

	});

	it('should extract from file', () => {
		const te = TemplateExtractor.fromFilename('test-files/extract.js');
		expect(te.extractObjectProperty('template')).to.deep.equal([
			'<p>foo</i>',
			'<b>foo</b>',
			'<p>foo</p>',
		]);
	});

});
