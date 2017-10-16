import { MetaTable, MetaElement, Validator } from 'meta';
import { Config } from '../config';
import { DOMNode } from '../dom'; // eslint-disable-line no-unused-vars
import Parser from '../parser';

class ConfigMock extends Config {
	constructor(metaTable: MetaTable){
		super();
		this.metaTable = metaTable;
	}
}

describe('Meta validator', function(){

	const chai = require('chai');
	const expect = chai.expect;
	chai.use(require('chai-spies'));

	describe('validatePermitted()', function(){

		it('should handle undefined', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('nil', {void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml('<foo/>').root.children;
			expect(Validator.validatePermitted(foo, undefined)).to.be.true;
		});

		it('should validate tagName', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('nil', {void: true}),
				nil: mockEntry('nil', {void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, nil] = parser.parseHtml('<foo/><nil/>').root.children;
			const rules = ['foo'];
			expect(Validator.validatePermitted(foo, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate tagName with qualifier', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('nil', {void: true}),
				nil: mockEntry('nil', {void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, nil] = parser.parseHtml('<foo/><nil/>').root.children;
			const rules = ['foo?'];
			expect(Validator.validatePermitted(foo, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate @meta', function(){
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry('nil', {void: true}),
				meta: mockEntry('meta', {metadata: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [meta, nil] = parser.parseHtml('<meta/><nil/>').root.children;
			const rules = ['@meta'];
			expect(Validator.validatePermitted(meta, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate @flow', function(){
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry('nil', {void: true}),
				flow: mockEntry('flow', {flow: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [flow, nil] = parser.parseHtml('<flow/><nil/>').root.children;
			const rules = ['@flow'];
			expect(Validator.validatePermitted(flow, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate @sectioning', function(){
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry('nil', {void: true}),
				sectioning: mockEntry('sectioning', {sectioning: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [sectioning, nil] = parser.parseHtml('<sectioning/><nil/>').root.children;
			const rules = ['@sectioning'];
			expect(Validator.validatePermitted(sectioning, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate @heading', function(){
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry('nil', {void: true}),
				heading: mockEntry('heading', {heading: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [heading, nil] = parser.parseHtml('<heading/><nil/>').root.children;
			const rules = ['@heading'];
			expect(Validator.validatePermitted(heading, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate @phrasing', function(){
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry('nil', {void: true}),
				phrasing: mockEntry('phrasing', {phrasing: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [phrasing, nil] = parser.parseHtml('<phrasing/><nil/>').root.children;
			const rules = ['@phrasing'];
			expect(Validator.validatePermitted(phrasing, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate @embedded', function(){
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry('nil', {void: true}),
				embedded: mockEntry('embedded', {embedded: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [embedded, nil] = parser.parseHtml('<embedded/><nil/>').root.children;
			const rules = ['@embedded'];
			expect(Validator.validatePermitted(embedded, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate @interactive', function(){
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry('nil', {void: true}),
				interactive: mockEntry('interactive', {interactive: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [interactive, nil] = parser.parseHtml('<interactive/><nil/>').root.children;
			const rules = ['@interactive'];
			expect(Validator.validatePermitted(interactive, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate multiple rules (OR)', function(){
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry('nil', {void: true}),
				flow: mockEntry('flow', {flow: true, void: true}),
				phrasing: mockEntry('phrasing', {phrasing: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [flow, phrasing, nil] = parser.parseHtml('<flow/><phrasing/><nil/>').root.children;
			const rules = ['@flow', '@phrasing'];
			expect(Validator.validatePermitted(flow, rules)).to.be.true;
			expect(Validator.validatePermitted(phrasing, rules)).to.be.true;
			expect(Validator.validatePermitted(nil, rules)).to.be.false;
		});

		it('should validate multiple rules (AND)', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('flow', {flow: true, phrasing: true, void: true}),
				flow: mockEntry('flow', {flow: true, phrasing: false, void: true}),
				phrasing: mockEntry('phrasing', {flow: false, phrasing: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, flow, phrasing] = parser.parseHtml('<foo/><flow/><phrasing/>').root.children;
			const rules = [['@flow', '@phrasing']];
			expect(Validator.validatePermitted(foo, rules)).to.be.true;
			expect(Validator.validatePermitted(flow, rules)).to.be.false;
			expect(Validator.validatePermitted(phrasing, rules)).to.be.false;
		});

		it('should support excluding tagname', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('foo', {flow: true, void: true}),
				bar: mockEntry('bar', {flow: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, bar] = parser.parseHtml('<foo/><bar/><nil/>').root.children;
			const rules = [['@flow', {
				exclude: 'bar',
			}]];
			expect(Validator.validatePermitted(foo, rules)).to.be.true;
			expect(Validator.validatePermitted(bar, rules)).to.be.false;
		});

		it('should support excluding category', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('foo', {flow: true, interactive: false, void: true}),
				bar: mockEntry('bar', {flow: true, interactive: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, bar] = parser.parseHtml('<foo/><bar/><nil/>').root.children;
			const rules = [['@flow', {
				exclude: '@interactive',
			}]];
			expect(Validator.validatePermitted(foo, rules)).to.be.true;
			expect(Validator.validatePermitted(bar, rules)).to.be.false;
		});

		it('should support excluding multiple targets', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('foo', {flow: true, interactive: false, void: true}),
				bar: mockEntry('bar', {flow: true, interactive: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, bar] = parser.parseHtml('<foo/><bar/><nil/>').root.children;
			const rules = [{exclude: ['bar', 'baz']}];
			expect(Validator.validatePermitted(foo, rules)).to.be.true;
			expect(Validator.validatePermitted(bar, rules)).to.be.false;
		});

		it('should support excluding multiple targets together', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('foo', {flow: true, interactive: false, void: true}),
				bar: mockEntry('bar', {flow: true, interactive: true, void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, bar] = parser.parseHtml('<foo/><bar/><nil/>').root.children;
			const rules = [['@flow', {
				exclude: ['bar', 'baz'],
			}]];
			expect(Validator.validatePermitted(foo, rules)).to.be.true;
			expect(Validator.validatePermitted(bar, rules)).to.be.false;
		});

	});

	describe('validatePermitted()', function(){

		it('should support missing qualifier', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('foo', {void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml('<foo/>').root.children;
			const rules = ['foo'];
			expect(Validator.validateOccurrences(foo, rules, 0)).to.be.true;
			expect(Validator.validateOccurrences(foo, rules, 9)).to.be.true;
		});

		it('should support ? qualifier', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('foo', {void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml('<foo/>').root.children;
			const rules = ['foo?'];
			expect(Validator.validateOccurrences(foo, rules, 0)).to.be.true;
			expect(Validator.validateOccurrences(foo, rules, 1)).to.be.true;
			expect(Validator.validateOccurrences(foo, rules, 2)).to.be.false;
		});

		it('should support * qualifier', function(){
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('foo', {void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml('<foo/>').root.children;
			const rules = ['foo*'];
			expect(Validator.validateOccurrences(foo, rules, 0)).to.be.true;
			expect(Validator.validateOccurrences(foo, rules, 9)).to.be.true;
		});

	});

	describe('validateOrder()', function(){

		let table: MetaTable;
		let parser: Parser;
		let cb: (node: DOMNode, prev: DOMNode) => void;

		beforeEach(function(){
			table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry('foo', {void: true}),
				bar: mockEntry('bar', {void: true, flow: true}),
			});
			parser = new Parser(new ConfigMock(table));
			cb = chai.spy();
		});

		it('should handle undefined rules', function(){
			const children = parser.parseHtml('<foo/>').root.children;
			expect(Validator.validateOrder(children, undefined, cb)).to.be.true;
			expect(cb).not.to.have.been.called;
		});

		it('should return error when elements are out of order', function(){
			const children = parser.parseHtml('<bar/><foo/>').root.children;
			const rules = ['foo', 'bar'];
			expect(Validator.validateOrder(children, rules, cb)).to.be.false;
			expect(cb).to.have.been.called.with(children[0], children[1]);
		});

		it('should not return error when elements are in order', function(){
			const children = parser.parseHtml('<foo/><bar/>').root.children;
			const rules = ['foo', 'bar'];
			expect(Validator.validateOrder(children, rules, cb)).to.be.true;
			expect(cb).not.to.have.been.called;
		});

		it('should handle elements with unspecified order', function(){
			const children = parser.parseHtml('<foo/><bar/><foo/>').root.children;
			const rules = ['foo'];
			expect(Validator.validateOrder(children, rules, cb)).to.be.true;
			expect(cb).not.to.have.been.called;
		});

		it('should handle categories', function(){
			const children1 = parser.parseHtml('<foo/><bar/>').root.children;
			const children2 = parser.parseHtml('<bar/><foo/>').root.children;
			const rules = ['foo', '@flow'];
			expect(Validator.validateOrder(children1, rules, cb)).to.be.true;
			expect(Validator.validateOrder(children2, rules, cb)).to.be.false;
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
		permittedOrder: [],
	}, stub);
}
