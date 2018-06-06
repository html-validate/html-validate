import { TemplateExtractor } from './template';

describe('TemplateExtractor', function(){

	const expect = require('chai').expect;

	it('should extract templates from object property', () => {
		const te = new TemplateExtractor('test-files/extract.js');
		expect(te.extractObjectProperty('template')).to.deep.equal([
			'<p>foo</i>',
			'<b>foo</b>',
			'<p>foo</p>',
		]);
	});

});
