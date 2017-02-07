import DOMNode from '../src/domnode';

describe('DOMNode', function(){

	const expect = require('chai').expect;

	describe('getElementsByTagName()', function(){

		it('should find elements', function(){
			/* eslint-disable no-unused-vars */
			const root = new DOMNode('root');
			const a = new DOMNode('foo', root);
			const b = new DOMNode('bar', root);
			const c = new DOMNode('foo', b);
			/* eslint-enable no-unused-vars */
			const nodes = root.getElementsByTagName('foo');
			expect(nodes).to.have.lengthOf(2);
		});

	});

});
