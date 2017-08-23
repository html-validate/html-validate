/* eslint-disable no-unused-vars */
import { Combinator, parseCombinator } from 'dom/combinator';
/* eslint-enable no-unused-vars */

describe('DOM Combinator', function(){

	const expect = require('chai').expect;

	it('should default to descendant combinator', function(){
		const result = parseCombinator('');
		expect(result).to.equal(Combinator.DESCENDANT);
	});

	it('should parse > as child combinator', function(){
		const result = parseCombinator('>');
		expect(result).to.equal(Combinator.CHILD);
	});

	it('should parse + as adjacent sibling combinator', function(){
		const result = parseCombinator('+');
		expect(result).to.equal(Combinator.ADJACENT_SIBLING);
	});

	it('should parse + as general sibling combinator', function(){
		const result = parseCombinator('~');
		expect(result).to.equal(Combinator.GENERAL_SIBLING);
	});

	it('should throw error on invalid combinator', function(){
		expect(() => parseCombinator('a')).to.throw();
	});

});
