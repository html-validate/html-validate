'use strict';

const chai = require('chai');
const expect = chai.expect;
const Lexer = require('../src/lexer');
const Token = require('../src/token');

chai.use(require('chai-subset'));

describe('lexer', function(){

	let lexer;

	beforeEach(function(){
		lexer = new Lexer();
	});

	describe('should tokenize', function(){

		it('xml declaration', function(){
			let token = lexer.tokenize({data: '<?xml version="1.0" encoding="utf-8"?>\n', filename: 'inline'});
			expect(token.next().done).to.be.true;
		});

		it('doctype', function(){
			let token = lexer.tokenize({data: '<!DOCTYPE html>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.DOCTYPE_OPEN});
			expect(token.next().value).to.containSubset({type: Token.DOCTYPE_VALUE});
			expect(token.next().value).to.containSubset({type: Token.DOCTYPE_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('open/void tags', function(){
			let token = lexer.tokenize({data: '<foo>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('self-closing tags', function(){
			let token = lexer.tokenize({data: '<foo/>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('close tags', function(){
			let token = lexer.tokenize({data: '</foo>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('tags with numbers', function(){
			let token = lexer.tokenize({data: '<h1>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('tags with dashes', function(){
			let token = lexer.tokenize({data: '<foo-bar>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('attribute with double-quotes', function(){
			let token = lexer.tokenize({data: '<foo bar="baz">', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.WHITESPACE});
			expect(token.next().value).to.containSubset({type: Token.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: Token.ATTR_VALUE});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('attribute with single-quotes', function(){
			let token = lexer.tokenize({data: '<foo bar=\'baz\'>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.WHITESPACE});
			expect(token.next().value).to.containSubset({type: Token.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: Token.ATTR_VALUE});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('unquoted attributes', function(){
			let token = lexer.tokenize({data: '<foo bar=baz>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.WHITESPACE});
			expect(token.next().value).to.containSubset({type: Token.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: Token.ATTR_VALUE});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('attribute without value', function(){
			let token = lexer.tokenize({data: '<foo bar>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.WHITESPACE});
			expect(token.next().value).to.containSubset({type: Token.ATTR_NAME});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('text', function(){
			let token = lexer.tokenize({data: 'foo', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TEXT});
			expect(token.next().done).to.be.true;
		});

		it('indented text', function(){
			let token = lexer.tokenize({data: '  foo', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.WHITESPACE});
			expect(token.next().value).to.containSubset({type: Token.TEXT});
			expect(token.next().done).to.be.true;
		});

		it('element with text', function(){
			let token = lexer.tokenize({data: '<p>foo</p>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: Token.TEXT});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('newlines', function(){
			let token = lexer.tokenize({data: '<p>\nfoo\n</p>', filename: 'inline'});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().value).to.containSubset({type: Token.WHITESPACE});
			expect(token.next().value).to.containSubset({type: Token.TEXT});
			expect(token.next().value).to.containSubset({type: Token.TAG_OPEN});
			expect(token.next().value).to.containSubset({type: Token.TAG_CLOSE});
			expect(token.next().done).to.be.true;
		});

		it('CDATA', function(){
			let token = lexer.tokenize({data: '<![CDATA[ <p>lorem</div> ipsum ]]>', filename: 'inline'});
			expect(token.next().done).to.be.true;
		});

	});

});
