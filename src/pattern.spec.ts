import { parsePattern } from './pattern';

describe('Pattern', function(){

	const expect = require('chai').expect;

	it('kebabcase should match strings with dashes', function(){
		const pattern = parsePattern('kebabcase');
		expect('foo-bar').to.match(pattern);
		expect('fooBar').to.not.match(pattern);
		expect('Foobar').to.not.match(pattern);
		expect('foo_bar').to.not.match(pattern);
	});

	it('camelcase should match strings in camelcase', function(){
		const pattern = parsePattern('camelcase');
		expect('foo-bar').to.not.match(pattern);
		expect('fooBar').to.match(pattern);
		expect('Foobar').to.not.match(pattern);
		expect('foo_bar').to.not.match(pattern);
	});

	it('underscore should match strings with underscore', function(){
		const pattern = parsePattern('underscore');
		expect('foo-bar').to.not.match(pattern);
		expect('fooBar').to.not.match(pattern);
		expect('Foobar').to.not.match(pattern);
		expect('foo_bar').to.match(pattern);
	});

	it('should support user-supplied regexp', function(){
		const pattern = parsePattern('^foo-[a-z]\\w+$');
		expect('foo-bar').to.match(pattern);
		expect('bar-foo').to.not.match(pattern);
		expect('barfoo-baz').to.not.match(pattern);
	});

});
