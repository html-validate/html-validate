'use strict';

var expect = require('chai').expect;
var HtmlLint = require('../src/htmllint');

describe('parser', function(){

	var events;
	var htmllint;

	before(function(){
		htmllint = new HtmlLint();
		htmllint.addListener('*', function(event){
			if ( ['tag:open', 'tag:close'].indexOf(event.event) >= 0 ){
				events.push({
					event: event.event,
					tagName: event.target ? event.target.tagName : undefined,
				});
			}
			if ( ['attr'].indexOf(event.event) >= 0 ){
				events.push({
					event: event.event,
					key: event.key,
					value: event.value,
				});
			}
		});
	});

	beforeEach(function(){
		events = [];
	});

	describe('should parse elements', function(){

		it('simple element', function(){
			expect(htmllint.string('<div></div>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with numbers', function(){
			expect(htmllint.string('<h1></h1>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'h1'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'h1'});
		});

		it('with dashes', function(){
			expect(htmllint.string('<foo-bar></foo-bar>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'foo-bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'foo-bar'});
		});

		it('elements closed on wrong order', function(){
			expect(htmllint.string('<div><p></div></p>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'p'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'p'});
		});

		it('self-closing elements', function(){
			expect(htmllint.string('<input/>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'input'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'input'});
		});

		it('void elements', function(){
			expect(htmllint.string('<input>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'input'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'input'});
		});

		it('with text node', function(){
			expect(htmllint.string('<p>Lorem ipsum</p>')).to.be.true;
		});

		it('with trailing text', function(){
			expect(htmllint.string('<p>Lorem ipsum</p>\n')).to.be.true;
		});

		it('unclosed', function(){
			expect(htmllint.string('<p>')).to.be.true;
		});

		it('unopened', function(){
			expect(htmllint.string('</p>')).to.be.true;
		});

		it('with newlines', function(){
			expect(htmllint.string('<div\nfoo="bar"></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with newline after attribute', function(){
			expect(htmllint.string('<div foo="bar"\nspam="ham"></div>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'spam', value: 'ham'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with xml namespaces', function(){
			expect(htmllint.string('<foo:div></foo:div>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'foo:div'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'foo:div'});
		});

	});

	describe('should parse attributes', function(){

		it('without quotes', function(){
			expect(htmllint.string('<div foo=bar></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with single quotes', function(){
			expect(htmllint.string('<div foo=\'bar\'></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with double quote', function(){
			expect(htmllint.string('<div foo="bar"></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with nested quotes', function(){
			expect(htmllint.string('<div foo=\'"foo"\' bar="\'foo\'"></div>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: '"foo"'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'bar', value: "'foo'"});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('without value', function(){
			expect(htmllint.string('<div foo></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: undefined});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with empty value', function(){
			expect(htmllint.string('<div foo="" bar=\'\'></div>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: ''});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'bar', value: ''});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with dashes', function(){
			expect(htmllint.string('<div foo-bar-baz></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo-bar-baz', value: undefined});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with spaces inside', function(){
			expect(htmllint.string('<div class="foo bar baz"></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'class', value: 'foo bar baz'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with uncommon characters', function(){
			expect(htmllint.string('<div a2?()!="foo"></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'a2?()!', value: 'foo'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with multiple attributes', function(){
			expect(htmllint.string('<div foo="bar" spam="ham"></div>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'spam', value: 'ham'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('on self-closing elements', function(){
			expect(htmllint.string('<input type="text"/>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'input'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'type', value: 'text'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'input'});
		});

		it('with xml namespaces', function(){
			expect(htmllint.string('<div foo:bar="baz"></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events.shift()).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events.shift()).to.deep.equal({event: 'attr', key: 'foo:bar', value: 'baz'});
			expect(events.shift()).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

	});

});
