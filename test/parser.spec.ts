/* eslint-disable no-unused-vars */
import Config from '../src/config';
import DOMTree from '../src/domtree';
import { EventCallback } from '../src/eventhandler';
import Parser from '../src/parser';
import HtmlLint from '../src/htmllint';
/* eslint-enable no-unused-vars */

describe('parser', function(){

	const chai = require('chai');
	const expect = chai.expect;

	let events: Array<any>;
	let parser: Parser;

	beforeEach(function(){
		events = [];
		parser = new Parser(Config.empty());
		parser.on('*', function(event, data){
			if ( ['tag:open', 'tag:close'].indexOf(event) >= 0 ){
				events.push({
					event,
					tagName: data.target ? data.target.tagName : undefined,
				});
			}
			if ( ['attr'].indexOf(event) >= 0 ){
				events.push({
					event,
					key: data.key,
					value: data.value,
				});
			}
		});
	});

	describe('should parse elements', function(){

		it('simple element', function(){
			parser.parseHtml('<div></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with numbers', function(){
			parser.parseHtml('<h1></h1>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'h1'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'h1'});
			expect(events.shift()).to.be.undefined;
		});

		it('with dashes', function(){
			parser.parseHtml('<foo-bar></foo-bar>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'foo-bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'foo-bar'});
			expect(events.shift()).to.be.undefined;
		});

		it('elements closed on wrong order', function(){
			parser.parseHtml('<div><p></div></p>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'p'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'p'});
			expect(events.shift()).to.be.undefined;
		});

		it('self-closing elements', function(){
			parser.parseHtml('<input/>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'input'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'input'});
			expect(events.shift()).to.be.undefined;
		});

		it('void elements', function(){
			parser.parseHtml('<input>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'input'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'input'});
			expect(events.shift()).to.be.undefined;
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
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with newline after attribute', function(){
			parser.parseHtml('<div foo="bar"\nspam="ham"></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'spam', value: 'ham'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with xml namespaces', function(){
			parser.parseHtml('<foo:div></foo:div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'foo:div'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'foo:div'});
			expect(events.shift()).to.be.undefined;
		});

	});

	describe('should parse attributes', function(){

		it('without quotes', function(){
			parser.parseHtml('<div foo=bar></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with single quotes', function(){
			parser.parseHtml('<div foo=\'bar\'></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with double quote', function(){
			parser.parseHtml('<div foo="bar"></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with nested quotes', function(){
			parser.parseHtml('<div foo=\'"foo"\' bar="\'foo\'"></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: '"foo"'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'bar', value: "'foo'"});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('without value', function(){
			parser.parseHtml('<div foo></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: undefined});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with empty value', function(){
			parser.parseHtml('<div foo="" bar=\'\'></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: ''});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'bar', value: ''});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with dashes', function(){
			parser.parseHtml('<div foo-bar-baz></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo-bar-baz', value: undefined});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with spaces inside', function(){
			parser.parseHtml('<div class="foo bar baz"></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'class', value: 'foo bar baz'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with uncommon characters', function(){
			parser.parseHtml('<div a2?()!="foo"></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'a2?()!', value: 'foo'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('with multiple attributes', function(){
			parser.parseHtml('<div foo="bar" spam="ham"></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'spam', value: 'ham'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

		it('on self-closing elements', function(){
			parser.parseHtml('<input type="text"/>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'input'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'type', value: 'text'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'input'});
			expect(events.shift()).to.be.undefined;
		});

		it('with xml namespaces', function(){
			parser.parseHtml('<div foo:bar="baz"></div>');
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo:bar', value: 'baz'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.be.undefined;
		});

	});

	describe('dom:ready', function(){

		let callback: EventCallback;
		let document: DOMTree;

		beforeEach(function(){
			callback = chai.spy(function(event: string, data: any){
				document = data.document;
			});
			parser.on('dom:ready', callback);
		});

		it('should trigger when parsing is complete', function(){
			parser.parseHtml('<div></div>');
			expect(callback).to.have.been.called.once();
		});

		it('should contain DOMTree as argument', function(){
			parser.parseHtml('<div></div>');
			expect(document).to.be.instanceof(DOMTree);
			expect(document.root.children).to.have.lengthOf(1);
		});

	});

	describe('regressiontesting', function(){

		let htmllint: HtmlLint;

		beforeEach(function(){
			htmllint = new HtmlLint({
				extends: ['htmllint:recommended'],
			});
		});

		it('multiline', function(){
			const report = htmllint.file('./test/files/multiline.html');
			expect(report.valid, "linting should report success").to.be.true;
		});

		it('xi:include', function(){
			const report = htmllint.file('./test/files/xi-include.html');
			expect(report.valid, "linting should report success").to.be.true;
		});

		it('cdata', function(){
			const report = htmllint.file('./test/files/cdata.html');
			expect(report.valid, "linting should report success").to.be.true;
		});

	});


});
