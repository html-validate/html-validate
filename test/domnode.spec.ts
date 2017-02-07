import DOMNode from '../src/domnode';

describe('DOMNode', function(){

	const expect = require('chai').expect;

	describe('getElementsByTagName()', function(){

		it('should find elements', function(){
			const root = new DOMNode('root');
			const a = new DOMNode('foo', root);
			const b = new DOMNode('bar', root);
			const c = new DOMNode('foo', b);
			const nodes = root.getElementsByTagName('foo');
			expect(nodes).to.have.lengthOf(2);
		});

	});

});
