import { MetaTable, MetaElement } from './';
import { Config } from '../config';
import { Parser } from '../parser';

class ConfigMock extends Config {
	constructor(metaTable: MetaTable){
		super();
		this.metaTable = metaTable;
	}
}

describe('MetaTable', function(){

	it('should throw error when meta has unknown properties', function(){
		const table = new MetaTable();
		expect(() => table.loadFromObject({
			foo: mockEntry('foo', {invalid: true}),
		})).toThrowError('Metadata for <foo> contains unknown property "invalid"');
	});

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
			expect(meta).not.toBeUndefined();
			expect(meta.tagName).toEqual('foo');
		});

		it('should be null for unknown elements', function(){
			const meta = table.getMetaFor('bar');
			expect(meta).toBeNull();
		});

		it('should be case insensitive', function(){
			const meta = table.getMetaFor('FOO');
			expect(meta).not.toBeUndefined();
			expect(meta.tagName).toEqual('foo');
		});

	});

	describe('expression', function(){

		let table: MetaTable;

		it('should throw exception when function is missing', () => {
			table = new MetaTable();
			table.loadFromObject({
				invalid: mockEntry('dynamic', {interactive: ['invalid'], void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			expect(() => parser.parseHtml('<invalid/>')).toThrowError('Failed to find function "invalid" when evaluating property expression');
		});

		it('should handle strings', () => {
			table = new MetaTable();
			table.loadFromObject({
				invalid: mockEntry('dynamic', {interactive: 'invalid', void: true}),
			});
			const parser = new Parser(new ConfigMock(table));
			expect(() => parser.parseHtml('<invalid/>')).toThrowError('Failed to find function "invalid" when evaluating property expression');
		});

		describe('isDescendant', function(){

			beforeEach(function(){
				table = new MetaTable();
				table.loadFromObject({
					foo: mockEntry('foo'),
					spam: mockEntry('spam'),
					ham: mockEntry('ham'),
					dynamic: mockEntry('dynamic', {interactive: ['isDescendant', 'ham'], void: true}),
					invalid: mockEntry('dynamic', {interactive: ['isDescendant', []], void: true}),
				});
			});

			it('should be true if child is a descendant of given tagName', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo><ham><dynamic/></ham></foo>').root;
				const el = dom.getElementsByTagName('dynamic');
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it('should be false if child is not a descendant of given tagName', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo><spam><dynamic/></spam></foo>').root;
				const el = dom.getElementsByTagName('dynamic');
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should throw exception when invalid argument is used', () => {
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml('<invalid/>')).toThrowError('Property expression "isDescendant" must take string argument when evaluating metadata for <invalid>');
			});

		});

		describe('hasAttribute', function(){

			beforeEach(function(){
				table = new MetaTable();
				table.loadFromObject({
					dynamic: mockEntry('dynamic', {interactive: ['hasAttribute', 'foo'], void: true}),
					invalid: mockEntry('dynamic', {interactive: ['hasAttribute', []], void: true}),
				});
			});

			it('should be true if element has given attribute', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<dynamic foo/>').root;
				const el = dom.getElementsByTagName('dynamic');
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it('should be false if element does not have given attribute', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<dynamic bar/>').root;
				const el = dom.getElementsByTagName('dynamic');
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should throw exception when invalid argument is used', () => {
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml('<invalid/>')).toThrowError('Property expression "hasAttribute" must take string argument when evaluating metadata for <invalid>');
			});

		});

		describe('matchAttribute', function(){

			beforeEach(function(){
				table = new MetaTable();
				table.loadFromObject({
					foo: mockEntry('dynamic', {interactive: ['matchAttribute', ['type', '=', 'hidden']], void: true}),
					bar: mockEntry('dynamic', {interactive: ['matchAttribute', ['type', '!=', 'hidden']], void: true}),
					invalid1: mockEntry('dynamic', {interactive: ['matchAttribute', ['type', '#', 'hidden']], void: true}),
					invalid2: mockEntry('dynamic', {interactive: ['matchAttribute', []], void: true}),
					invalid3: mockEntry('dynamic', {interactive: ['matchAttribute', 'foo'], void: true}),
				});
			});

			it('should be true when "=" is used to match existing value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo type="hidden"/>').root;
				const el = dom.getElementsByTagName('foo');
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it('should be false when "=" is used to match other value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo type="other"/>').root;
				const el = dom.getElementsByTagName('foo');
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should be false when "=" is used to match missing value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo/>').root;
				const el = dom.getElementsByTagName('foo');
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should be false when "!=" is used to match existing value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar type="hidden"/>').root;
				const el = dom.getElementsByTagName('bar');
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should be true when "!=" is used to match other value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar type="other"/>').root;
				const el = dom.getElementsByTagName('bar');
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it('should be false when "!=" is used to match missing value', function(){
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar/>').root;
				const el = dom.getElementsByTagName('bar');
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it('should throw exception when invalid operator is used', () => {
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml('<invalid1/>')).toThrowError('Property expression "matchAttribute" has invalid operator "#" when evaluating metadata for <invalid1>');
			});

			it('should throw exception when parameters is malformed', () => {
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml('<invalid2/>')).toThrowError('Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <invalid2>');
				expect(() => parser.parseHtml('<invalid3/>')).toThrowError('Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <invalid3>');
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
		implicitClosed: [],
		deprecatedAttributes: [],
		permittedContent: [],
		permittedDescendants: [],
		permittedOrder: [],
	}, stub);
}
