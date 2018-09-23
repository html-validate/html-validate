import { TokenType } from './token';
import { Lexer } from './lexer';

function inlineSource(source: string, {line = 1, column = 1} = {}){
	return {
		data: source,
		filename: 'inline',
		line,
		column,
	};
}

describe('lexer', function(){
	let lexer: Lexer;

	beforeEach(function(){
		lexer = new Lexer();
	});

	it('should read location information from source', () => {
		const source = inlineSource('<p></p>', {line: 5, column: 42});
		const token = lexer.tokenize(source);
		expect(token.next()).toBeToken({type: TokenType.TAG_OPEN, location: {line: 5, column: 42, filename: expect.any(String)}});  // <p
		expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE, location: {line: 5, column: 44, filename: expect.any(String)}}); // >
		expect(token.next()).toBeToken({type: TokenType.TAG_OPEN, location: {line: 5, column: 45, filename: expect.any(String)}});  // </p
		expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE, location: {line: 5, column: 48, filename: expect.any(String)}}); // >
		expect(token.next()).toBeToken({type: TokenType.EOF});
		expect(token.next().done).toBeTruthy();
	});

	describe('should tokenize', function(){

		it('xml declaration', function(){
			const token = lexer.tokenize(inlineSource('<?xml version="1.0" encoding="utf-8"?>\n'));
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('uppercase doctype', function(){
			const token = lexer.tokenize(inlineSource('<!DOCTYPE html>'));
			expect(token.next()).toBeToken({type: TokenType.DOCTYPE_OPEN});
			expect(token.next()).toBeToken({type: TokenType.DOCTYPE_VALUE});
			expect(token.next()).toBeToken({type: TokenType.DOCTYPE_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('lowercase doctype', function(){
			const token = lexer.tokenize(inlineSource('<!doctype html>'));
			expect(token.next()).toBeToken({type: TokenType.DOCTYPE_OPEN});
			expect(token.next()).toBeToken({type: TokenType.DOCTYPE_VALUE});
			expect(token.next()).toBeToken({type: TokenType.DOCTYPE_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('whitespace before doctype', function(){
			const token = lexer.tokenize(inlineSource(' <!doctype html>'));
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.DOCTYPE_OPEN});
			expect(token.next()).toBeToken({type: TokenType.DOCTYPE_VALUE});
			expect(token.next()).toBeToken({type: TokenType.DOCTYPE_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('open/void tags', function(){
			const token = lexer.tokenize(inlineSource('<foo>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('self-closing tags', function(){
			const token = lexer.tokenize(inlineSource('<foo/>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('close tags', function(){
			const token = lexer.tokenize(inlineSource('</foo>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('tags with numbers', function(){
			const token = lexer.tokenize(inlineSource('<h1>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('tags with dashes', function(){
			const token = lexer.tokenize(inlineSource('<foo-bar>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('attribute with double-quotes', function(){
			const token = lexer.tokenize(inlineSource('<foo bar="baz">'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.ATTR_VALUE});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('attribute with single-quotes', function(){
			const token = lexer.tokenize(inlineSource('<foo bar=\'baz\'>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.ATTR_VALUE});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('unquoted attributes', function(){
			const token = lexer.tokenize(inlineSource('<foo bar=baz>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.ATTR_VALUE, data: ['=baz', 'baz']});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('unquoted numerical attributes', function(){
			const token = lexer.tokenize(inlineSource('<foo rows=5>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME, data: ['rows', 'rows']});
			expect(token.next()).toBeToken({type: TokenType.ATTR_VALUE, data: ['=5', '5']});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('attribute without value', function(){
			const token = lexer.tokenize(inlineSource('<foo bar>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('attribute with LF', function(){
			const token = lexer.tokenize(inlineSource('<foo\nbar>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('attribute with CR', function(){
			const token = lexer.tokenize(inlineSource('<foo\rbar>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['\r']});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('attribute with CRLF', function(){
			const token = lexer.tokenize(inlineSource('<foo\r\nbar>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['\r\n']});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('attribute with tag inside', function(){
			const token = lexer.tokenize(inlineSource('<foo bar="<div>">'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.ATTR_VALUE});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('text', function(){
			const token = lexer.tokenize(inlineSource('foo'));
			expect(token.next()).toBeToken({type: TokenType.TEXT});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('indented text', function(){
			const token = lexer.tokenize(inlineSource('  foo'));
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.TEXT});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('element with text', function(){
			const token = lexer.tokenize(inlineSource('<p>foo</p>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.TEXT});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('newlines', function(){
			const token = lexer.tokenize(inlineSource('<p>\nfoo\n</p>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.TEXT});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('whitespace CR', function(){
			const token = lexer.tokenize(inlineSource('<p>\r  foo\r</p>  \r'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['\r']});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['  ']});
			expect(token.next()).toBeToken({type: TokenType.TEXT, data: ['foo']});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['\r']});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['  \r']});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('whitespace LF', function(){
			const token = lexer.tokenize(inlineSource('<p>\n  foo\n</p>  \n'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['\n']});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['  ']});
			expect(token.next()).toBeToken({type: TokenType.TEXT, data: ['foo']});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['\n']});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['  \n']});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('whitespace CRLF', function(){
			const token = lexer.tokenize(inlineSource('<p>\r\n  foo\r\n</p>  \r\n'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['\r\n']});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['  ']});
			expect(token.next()).toBeToken({type: TokenType.TEXT, data: ['foo']});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['\r\n']});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE, data: ['  \r\n']});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('nested with text', function(){
			const token = lexer.tokenize(inlineSource('<div>\n  <p>foo</p>\n</div>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.TEXT});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('CDATA', function(){
			const token = lexer.tokenize(inlineSource('<![CDATA[ <p>lorem</div> ipsum ]]>'));
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('script tag', function(){
			const token = lexer.tokenize(inlineSource('<script>document.write("<p>lorem</p>");</script>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.SCRIPT});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('script tag with type', function(){
			const token = lexer.tokenize(inlineSource('<script type="text/javascript">document.write("<p>lorem</p>");</script>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.ATTR_VALUE});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.SCRIPT});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('self-closed script tag', function(){
			/* not legal but lexer shouldn't choke on it */
			const token = lexer.tokenize(inlineSource('<head><script src="foo.js"/></head>'));
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN, data: ['<head', '', 'head']});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN, data: ['<script', '', 'script']});
			expect(token.next()).toBeToken({type: TokenType.WHITESPACE});
			expect(token.next()).toBeToken({type: TokenType.ATTR_NAME});
			expect(token.next()).toBeToken({type: TokenType.ATTR_VALUE});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN, data: ['</head', '/', 'head']});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('multiple script tags', function(){
			const token = lexer.tokenize(inlineSource('<script>foo</script>bar<script>baz</script>'));
			/* first script tag */
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.SCRIPT, data: ['foo']});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			/* text inbetween */
			expect(token.next()).toBeToken({type: TokenType.TEXT, data: ['bar']});
			/* second script tag */
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.SCRIPT, data: ['baz']});
			expect(token.next()).toBeToken({type: TokenType.TAG_OPEN});
			expect(token.next()).toBeToken({type: TokenType.TAG_CLOSE});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('comment', function(){
			const token = lexer.tokenize(inlineSource('<!-- comment -->'));
			expect(token.next()).toBeToken({type: TokenType.COMMENT, data: ['<!-- comment -->', ' comment ']});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		it('html-validate directive', () => {
			const token = lexer.tokenize(inlineSource('<!-- [html-validate-action options: comment] -->'));
			expect(token.next()).toBeToken({type: TokenType.DIRECTIVE, data: ['<!-- [html-validate-action options: comment] -->', 'action options: comment']});
			expect(token.next()).toBeToken({type: TokenType.EOF});
			expect(token.next().done).toBeTruthy();
		});

		describe('browser conditional', function(){

			it('downlevel-hidden', function(){
				const token = lexer.tokenize(inlineSource('<!--[if IE 6]>foo<![endif]-->'));
				expect(token.next()).toBeToken({type: TokenType.CONDITIONAL, data: ['<!--[if IE 6]>', 'if IE 6']});
				expect(token.next()).toBeToken({type: TokenType.TEXT, data: ['foo']});
				expect(token.next()).toBeToken({type: TokenType.CONDITIONAL, data: ['<![endif]-->', 'endif']});
				expect(token.next()).toBeToken({type: TokenType.EOF});
				expect(token.next().done).toBeTruthy();
			});

			it('downlevel-reveal', function(){
				const token = lexer.tokenize(inlineSource('<![if IE 6]>foo<![endif]>'));
				expect(token.next()).toBeToken({type: TokenType.CONDITIONAL, data: ['<![if IE 6]>', 'if IE 6']});
				expect(token.next()).toBeToken({type: TokenType.TEXT, data: ['foo']});
				expect(token.next()).toBeToken({type: TokenType.CONDITIONAL, data: ['<![endif]>', 'endif']});
				expect(token.next()).toBeToken({type: TokenType.EOF});
			});

			it('nested comment', function(){
				const token = lexer.tokenize(inlineSource('<!--[if IE 6]><!-- foo --><![endif]-->'));
				expect(token.next()).toBeToken({type: TokenType.CONDITIONAL, data: ['<!--[if IE 6]>', 'if IE 6']});
				expect(token.next()).toBeToken({type: TokenType.COMMENT, data: ['<!-- foo -->', ' foo ']});
				expect(token.next()).toBeToken({type: TokenType.CONDITIONAL, data: ['<![endif]-->', 'endif']});
				expect(token.next()).toBeToken({type: TokenType.EOF});
			});

		});

	});

});
