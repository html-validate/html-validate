import { parsePattern } from './pattern';

describe('Pattern', function(){
	it('kebabcase should match strings with dashes', function(){
		const pattern = parsePattern('kebabcase');
		expect('foo-bar').toMatch(pattern);
		expect('fooBar').not.toMatch(pattern);
		expect('Foobar').not.toMatch(pattern);
		expect('foo_bar').not.toMatch(pattern);
	});

	it('camelcase should match strings in camelcase', function(){
		const pattern = parsePattern('camelcase');
		expect('foo-bar').not.toMatch(pattern);
		expect('fooBar').toMatch(pattern);
		expect('Foobar').not.toMatch(pattern);
		expect('foo_bar').not.toMatch(pattern);
	});

	it('underscore should match strings with underscore', function(){
		const pattern = parsePattern('underscore');
		expect('foo-bar').not.toMatch(pattern);
		expect('fooBar').not.toMatch(pattern);
		expect('Foobar').not.toMatch(pattern);
		expect('foo_bar').toMatch(pattern);
	});

	it('should support user-supplied regexp', function(){
		const pattern = parsePattern('^foo-[a-z]\\w+$');
		expect('foo-bar').toMatch(pattern);
		expect('bar-foo').not.toMatch(pattern);
		expect('barfoo-baz').not.toMatch(pattern);
	});

});
