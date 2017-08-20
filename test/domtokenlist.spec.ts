import { DOMTokenList } from '../src/domtokenlist';

describe('DOMTokenList', function(){

	const expect = require('chai').expect;

	it('should split string into parts', () => {
		const list = new DOMTokenList('foo bar baz');
		expect(list).to.have.lengthOf(3);
		expect(Array.from(list)).to.deep.equal(['foo', 'bar', 'baz']);
	});

	it('should handle empty string', () => {
		const list = new DOMTokenList('');
		expect(list).to.have.lengthOf(0);
		expect(Array.from(list)).to.deep.equal([]);
	});

	it('should handle null', () => {
		const list = new DOMTokenList(null);
		expect(list).to.have.lengthOf(0);
		expect(Array.from(list)).to.deep.equal([]);
	});

	it('.value should return original value', () => {
		const list = new DOMTokenList('foo bar baz');
		expect(list.value).to.equal('foo bar baz');
	});

	describe('item()', () => {

		it('should return item by index', () => {
			const list = new DOMTokenList('foo bar baz');
			expect(list.item(1)).to.equal('bar');
		});

		it('should return undefined if out of range', () => {
			const list = new DOMTokenList('foo bar baz');
			expect(list.item(-1)).to.be.undefined;
			expect(list.item(3)).to.be.undefined;
		});

	});

	describe('contains()', () => {

		it('should return true if token exists', () => {
			const list = new DOMTokenList('foo bar baz');
			expect(list.contains('baz')).to.be.true;
		});

		it('should return false if token doesn\'t exists', () => {
			const list = new DOMTokenList('foo bar baz');
			expect(list.contains('spam')).to.be.false;
		});

	});

});
