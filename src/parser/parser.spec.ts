import { Config } from '../config';
import { DOMNode, DOMTree } from '../dom';
import { EventCallback } from '../event';
import { InvalidTokenError } from '../lexer';
import { Parser } from './parser';
import HtmlValidate from '../htmlvalidate';
import '../matchers';

function mergeEvent(event: string, data: any){
	const merged = Object.assign({}, {event}, data);

	/* not useful for these tests */
	delete merged.location;

	/* change DOMNode instances to just tagname for easier testing */
	for (const key of ['target', 'previous']){
		if (merged[key] && merged[key] instanceof DOMNode){
			merged[key] = merged[key].tagName;
		}
	}

	return merged;
}

describe('parser', function(){

	const ignoredEvents = [
		'dom:load',
		'dom:ready',
		'whitespace',
	];

	let events: Array<any>;
	let parser: Parser;

	beforeEach(function(){
		events = [];
		parser = new Parser(Config.empty());
		parser.on('*', (event: string, data: any) => {
			if (ignoredEvents.includes(event)) return;
			events.push(mergeEvent(event, data));
		});
	});

	describe('should parse elements', function(){

		it('simple element', function(){
			parser.parseHtml('<div></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with numbers', function(){
			parser.parseHtml('<h1></h1>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'h1'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'h1', previous: 'h1'});
			expect(events.shift()).toBeUndefined();
		});

		it('with dashes', function(){
			parser.parseHtml('<foo-bar></foo-bar>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'foo-bar'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'foo-bar', previous: 'foo-bar'});
			expect(events.shift()).toBeUndefined();
		});

		it('elements closed on wrong order', function(){
			parser.parseHtml('<div><label></div></label>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:open', target: 'label'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'label'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'label', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('self-closing elements', function(){
			parser.parseHtml('<input/>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'input'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'input', previous: 'input'});
			expect(events.shift()).toBeUndefined();
		});

		it('void elements', function(){
			parser.parseHtml('<input>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'input'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'input', previous: 'input'});
			expect(events.shift()).toBeUndefined();
		});

		it('with text node', function(){
			parser.parseHtml('<p>Lorem ipsum</p>');
		});

		it('with trailing text', function(){
			parser.parseHtml('<p>Lorem ipsum</p>\n');
		});

		it('unclosed', function(){
			parser.parseHtml('<p>');
		});

		it('unopened', function(){
			parser.parseHtml('</p>');
		});

		it('multiple unopened', function(){
			/* mostly for regression testing: root element should never be
			 * popped from node stack. */
			parser.parseHtml('</p></p></p></p></p></p>');
		});

		it('with only text', function(){
			parser.parseHtml('Lorem ipsum');
		});

		it('with newlines', function(){
			parser.parseHtml('<div\nfoo="bar"></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo', value: 'bar', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with newline after attribute', function(){
			parser.parseHtml('<div foo="bar"\nspam="ham"></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo', value: 'bar', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'spam', value: 'ham', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with xml namespaces', function(){
			parser.parseHtml('<foo:div></foo:div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'foo:div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'foo:div', previous: 'foo:div'});
			expect(events.shift()).toBeUndefined();
		});

	});

	describe('should fail on', function(){

		it('start tag with missing ">"', function(){
			expect(() => {
				parser.parseHtml('<p\n<p>foo</p></p>');
			}).toThrow(InvalidTokenError);
		});

	});

	describe('should parse attributes', function(){

		it('without quotes', function(){
			parser.parseHtml('<div foo=bar></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo', value: 'bar', quote: undefined, target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with single quotes', function(){
			parser.parseHtml('<div foo=\'bar\'></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo', value: 'bar', quote: "'", target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with double quote', function(){
			parser.parseHtml('<div foo="bar"></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo', value: 'bar', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with nested quotes', function(){
			parser.parseHtml('<div foo=\'"foo"\' bar="\'foo\'"></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo', value: '"foo"', quote: "'", target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'bar', value: "'foo'", quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('without value', function(){
			parser.parseHtml('<div foo></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo', value: undefined, quote: undefined, target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with empty value', function(){
			parser.parseHtml('<div foo="" bar=\'\'></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo', value: '', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'bar', value: '', quote: "'", target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with dashes', function(){
			parser.parseHtml('<div foo-bar-baz></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo-bar-baz', value: undefined, quote: undefined, target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with spaces inside', function(){
			parser.parseHtml('<div class="foo bar baz"></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'class', value: 'foo bar baz', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with uncommon characters', function(){
			parser.parseHtml('<div a2?()!="foo"></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'a2?()!', value: 'foo', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('with multiple attributes', function(){
			parser.parseHtml('<div foo="bar" spam="ham"></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo', value: 'bar', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'spam', value: 'ham', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

		it('on self-closing elements', function(){
			parser.parseHtml('<input type="text"/>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'input'});
			expect(events.shift()).toEqual({event: 'attr', key: 'type', value: 'text', quote: '"', target: 'input'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'input', previous: 'input'});
			expect(events.shift()).toBeUndefined();
		});

		it('with xml namespaces', function(){
			parser.parseHtml('<div foo:bar="baz"></div>');
			expect(events.shift()).toEqual({event: 'tag:open', target: 'div'});
			expect(events.shift()).toEqual({event: 'attr', key: 'foo:bar', value: 'baz', quote: '"', target: 'div'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'div', previous: 'div'});
			expect(events.shift()).toBeUndefined();
		});

	});

	describe('should parse directive', () => {

		it('with action', () => {
			parser.parseHtml('<!-- [html-validate-foo-bar] -->');
			expect(events.shift()).toEqual({event: 'directive', action: 'foo-bar', data: '', comment: ''});
			expect(events.shift()).toBeUndefined();
		});

		it('with options', () => {
			parser.parseHtml('<!-- [html-validate-enable foo bar] -->');
			expect(events.shift()).toEqual({event: 'directive', action: 'enable', data: 'foo bar', comment: ''});
			expect(events.shift()).toBeUndefined();
		});

		it('with comment', () => {
			parser.parseHtml('<!-- [html-validate-enable: lorem ipsum] -->');
			expect(events.shift()).toEqual({event: 'directive', action: 'enable', data: '', comment: 'lorem ipsum'});
			expect(events.shift()).toBeUndefined();
		});

		it('with options and comment', () => {
			parser.parseHtml('<!-- [html-validate-enable foo bar: baz] -->');
			expect(events.shift()).toEqual({event: 'directive', action: 'enable', data: 'foo bar', comment: 'baz'});
			expect(events.shift()).toBeUndefined();
		});

	});

	describe('should handle optional end tags', function(){

		it('<li>', function(){
			parser.parseHtml(`
				<ul>
					<li>explicit</li>
					<li>implicit
					<li><strong>nested</strong>
					<li><input>
				</ul>`);
			expect(events.shift()).toEqual({event: 'tag:open', target: 'ul'});
			expect(events.shift()).toEqual({event: 'tag:open', target: 'li'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'li', previous: 'li'});
			expect(events.shift()).toEqual({event: 'tag:open', target: 'li'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'li', previous: 'li'});
			expect(events.shift()).toEqual({event: 'tag:open', target: 'li'});
			expect(events.shift()).toEqual({event: 'tag:open', target: 'strong'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'strong', previous: 'strong'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'li', previous: 'li'});
			expect(events.shift()).toEqual({event: 'tag:open', target: 'li'});
			expect(events.shift()).toEqual({event: 'tag:open', target: 'input'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'input', previous: 'input'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'ul', previous: 'li'});
			expect(events.shift()).toEqual({event: 'tag:close', target: 'ul', previous: 'ul'});
			expect(events.shift()).toBeUndefined();
		});

	});

	describe('dom:ready', function(){

		let callback: EventCallback;
		let document: DOMTree;

		beforeEach(function(){
			callback = jest.fn((event: string, data: any) => {
				document = data.document;
			});
			parser.on('dom:ready', callback);
		});

		it('should trigger when parsing is complete', function(){
			parser.parseHtml('<div></div>');
			expect(callback).toHaveBeenCalled();
		});

		it('should contain DOMTree as argument', function(){
			parser.parseHtml('<div></div>');
			expect(document).toBeInstanceOf(DOMTree);
			expect(document.root.children).toHaveLength(1);
		});

	});

	describe('should parse', function(){

		it('doctype', function(){
			const dom = parser.parseHtml('<!doctype foobar>');
			expect(events.shift()).toEqual({event: 'doctype', value: 'foobar'});
			expect(events.shift()).toBeUndefined();
			expect(dom.doctype).toEqual('foobar');
		});

	});

	describe('regressiontesting', function(){

		let htmlvalidate: HtmlValidate;

		beforeEach(function(){
			htmlvalidate = new HtmlValidate({
				extends: ['htmlvalidate:recommended'],
			});
		});

		it('multiline', function(){
			const report = htmlvalidate.validateFile('./test-files/parser/multiline.html');
			expect(report).toBeValid();
		});

		it('xi:include', function(){
			const report = htmlvalidate.validateFile('./test-files/parser/xi-include.html');
			expect(report).toBeValid();
		});

		it('cdata', function(){
			const report = htmlvalidate.validateFile('./test-files/parser/cdata.html');
			expect(report).toBeValid();
		});

	});

	describe('defer()', () => {

		it('should push wildcard event on event queue', () => {
			const cb = jest.fn();
			(parser as any).event.once = jest.fn((event, fn) => fn());
			parser.defer(cb);
			expect((parser as any).event.once).toHaveBeenCalledWith('*', cb);
			expect(cb).toHaveBeenCalled();
		});

	});

});
