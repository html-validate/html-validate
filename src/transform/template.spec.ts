import { TemplateExtractor } from './template';

describe('TemplateExtractor', function(){

	const expect = require('chai').expect;

	it('should extract templates from object property', () => {
		const te = TemplateExtractor.fromFilename('test-files/extract.js');
		expect(te.extractObjectProperty('template')).to.deep.equal([
			'<p>foo</i>',
			'<b>foo</b>',
			'<p>foo</p>',
		]);
	});

	it('should extract from string source', () => {
		const te = TemplateExtractor.fromString('const x = {template: "<b>foo</b>"}');
		expect(te.extractObjectProperty('template')).to.deep.equal([
			'<b>foo</b>',
		]);
	});

});
