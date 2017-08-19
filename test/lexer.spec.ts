import { TokenType } from '../src/token';
import { Lexer } from '../src/lexer';

describe('lexer', function(){

	const chai = require('chai');
	const expect = chai.expect;

	chai.use(require('chai-subset'));

	let lexer: Lexer;

	beforeEach(function(){
		lexer = new Lexer();
	});

	describe('should tokenize', function(){

		it('xml declaration', function(){
			const token = lexer.tokenize({data: '<?xml version="1.0" encoding="utf-8"?>\n', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('doctype', function(){
			const token = lexer.tokenize({data: '<!DOCTYPE html>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.DOCTYPE_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.DOCTYPE_VALUE});
			expect(token.next().value).to.containSubset({type: TokenType.DOCTYPE_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('open/void tags', function(){
			const token = lexer.tokenize({data: '<foo>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('self-closing tags', function(){
			const token = lexer.tokenize({data: '<foo/>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('close tags', function(){
			const token = lexer.tokenize({data: '</foo>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('tags with numbers', function(){
			const token = lexer.tokenize({data: '<h1>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('tags with dashes', function(){
			const token = lexer.tokenize({data: '<foo-bar>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('attribute with double-quotes', function(){
			const token = lexer.tokenize({data: '<foo bar="baz">', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_VALUE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('attribute with single-quotes', function(){
			const token = lexer.tokenize({data: '<foo bar=\'baz\'>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_VALUE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('unquoted attributes', function(){
			const token = lexer.tokenize({data: '<foo bar=baz>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_VALUE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('unquoted numerical attributes', function(){
			const token = lexer.tokenize({data: '<foo rows=5>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_NAME, data: ['rows', 'rows']});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_VALUE, data: ['5', '5']});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('attribute without value', function(){
			const token = lexer.tokenize({data: '<foo bar>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('attribute with tag inside', function(){
			const token = lexer.tokenize({data: '<foo bar="<div>">', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_VALUE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('text', function(){
			const token = lexer.tokenize({data: 'foo', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TEXT});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('indented text', function(){
			const token = lexer.tokenize({data: '  foo', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.TEXT});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('element with text', function(){
			const token = lexer.tokenize({data: '<p>foo</p>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.TEXT});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('newlines', function(){
			const token = lexer.tokenize({data: '<p>\nfoo\n</p>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.TEXT});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('whitespace', function(){
			const token = lexer.tokenize({data: '<p>\n  foo\n</p>  \n', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.TEXT});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('nested with text', function(){
			const token = lexer.tokenize({data: '<div>\n  <p>foo</p>\n</div>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.TEXT});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('CDATA', function(){
			const token = lexer.tokenize({data: '<![CDATA[ <p>lorem</div> ipsum ]]>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('script tag', function(){
			const token = lexer.tokenize({data: '<script>document.write("<p>lorem</p>");</script>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.SCRIPT});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('script tag with type', function(){
			const token = lexer.tokenize({data: '<script type="text/javascript">document.write("<p>lorem</p>");</script>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_VALUE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.SCRIPT});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('self-closed script tag', function(){
			/* not legal but lexer shouldn't choke on it */
			const token = lexer.tokenize({data: '<head><script src="foo.js"/></head>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN, data: ['<head']});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN, data: ['<script']});
			expect(token.next().value).to.containSubset({type: TokenType.WHITESPACE});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: TokenType.ATTR_VALUE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_OPEN, data: ['</head']});
			expect(token.next().value).to.containSubset({type: TokenType.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

		it('comment', function(){
			const token = lexer.tokenize({data: '<!-- comment -->', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: TokenType.COMMENT, data: ['<!-- comment -->', ' comment ']});
			expect(token.next().value).to.containSubset({type: TokenType.EOF});
			expect(token.next().done).to.be.true;
		});

	});

});
