import { Combinator, parseCombinator } from './combinator';

describe('DOM Combinator', function(){
	it('should default to descendant combinator', function(){
		const result = parseCombinator('');
		expect(result).toEqual(Combinator.DESCENDANT);
	});

	it('should parse > as child combinator', function(){
		const result = parseCombinator('>');
		expect(result).toEqual(Combinator.CHILD);
	});

	it('should parse + as adjacent sibling combinator', function(){
		const result = parseCombinator('+');
		expect(result).toEqual(Combinator.ADJACENT_SIBLING);
	});

	it('should parse + as general sibling combinator', function(){
		const result = parseCombinator('~');
		expect(result).toEqual(Combinator.GENERAL_SIBLING);
	});

	it('should throw error on invalid combinator', function(){
		expect(() => parseCombinator('a')).toThrow();
	});

});
