import { MetaTable, MetaElement } from 'meta';
import { Config } from '../config';
import Parser from '../parser';

class ConfigMock extends Config {
	constructor(metaTable: MetaTable){
		super();
		this.metaTable = metaTable;
	}
}

describe('MetaTable', function(){

	const expect = require('chai').expect;

	describe('getMetaFor', function(){

		let table: MetaTable;

		beforeEach(function(){
			table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('foo', {phrasing: true}),
			});
		});

		it('should be populated for known elements', function(){
			const meta = table.getMetaFor('foo');
			expect(meta).not.to.be.undefined;
			expect(meta.tagName).to.equal('foo');
		});

		it('should be null for unknown elements', function(){
			const meta = table.getMetaFor('bar');
			expect(meta).to.be.null;
		});

	});

	describe('expression', function(){

		let table: MetaTable;

		describe('isDescendant', function(){

			beforeEach(function(){
				table = new MetaTable();
				table.loadFromObject({
					foo: mockEntry('foo'),
					spam: mockEntry('spam'),
					ham: mockEntry('ham'),
					dynamic: mockEntry('dynamic', {interactive: ['isDescendant', 'ham'], void: true}),
				});
			});

			it('should be true if child is a descendant of given tagName', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo><ham><dynamic/></ham></foo>').root;
				const el = dom.getElementsByTagName('dynamic');
				expect(el[0].meta.interactive).to.be.true;
			});

			it('should be false if child is not a descendant of given tagName', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo><spam><dynamic/></spam></foo>').root;
				const el = dom.getElementsByTagName('dynamic');
				expect(el[0].meta.interactive).to.be.false;
			});

		});

		describe('hasAttribute', function(){

			beforeEach(function(){
				table = new MetaTable();
				table.loadFromObject({
					dynamic: mockEntry('dynamic', {interactive: ['hasAttribute', 'foo'], void: true}),
				});
			});

			it('should be true if element has given attribute', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<dynamic foo/>').root;
				const el = dom.getElementsByTagName('dynamic');
				expect(el[0].meta.interactive).to.be.true;
			});

			it('should be false if element does not have given attribute', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<dynamic bar/>').root;
				const el = dom.getElementsByTagName('dynamic');
				expect(el[0].meta.interactive).to.be.false;
			});

		});

		describe('matchAttribute', function(){

			beforeEach(function(){
				table = new MetaTable();
				table.loadFromObject({
					foo: mockEntry('dynamic', {interactive: ['matchAttribute', ['type', '=', 'hidden']], void: true}),
					bar: mockEntry('dynamic', {interactive: ['matchAttribute', ['type', '!=', 'hidden']], void: true}),
				});
			});

			it('should be true when "=" is used to match existing value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo type="hidden"/>').root;
				const el = dom.getElementsByTagName('foo');
				expect(el[0].meta.interactive).to.be.true;
			});

			it('should be false when "=" is used to match other value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo type="other"/>').root;
				const el = dom.getElementsByTagName('foo');
				expect(el[0].meta.interactive).to.be.false;
			});

			it('should be false when "=" is used to match missing value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo/>').root;
				const el = dom.getElementsByTagName('foo');
				expect(el[0].meta.interactive).to.be.false;
			});

			it('should be false when "!=" is used to match existing value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar type="hidden"/>').root;
				const el = dom.getElementsByTagName('bar');
				expect(el[0].meta.interactive).to.be.false;
			});

			it('should be true when "!=" is used to match other value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar type="other"/>').root;
				const el = dom.getElementsByTagName('bar');
				expect(el[0].meta.interactive).to.be.true;
			});

			it('should be false when "!=" is used to match missing value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar/>').root;
				const el = dom.getElementsByTagName('bar');
				expect(el[0].meta.interactive).to.be.true;
			});

		});

	});

});

function mockEntry(tagName: string, stub = {}): MetaElement {
	return Object.assign({
		tagName,
		metadata: false,
		flow: false,
		sectioning: false,
		heading: false,
		phrasing: false,
		embedded: false,
		interactive: false,
		deprecated: false,
		void: false,
		transparent: false,
		permittedContent: [],
		permittedDescendants: [],
	}, stub);
}
