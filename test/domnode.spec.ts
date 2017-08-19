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

	describe('visitDepthFirst()', function(){

		it('should visit all nodes in correct order', function(){
			const root = new DOMNode('root');
			/* eslint-disable no-unused-vars */
			const a = new DOMNode('a', root);
			const b = new DOMNode('b', root);
			const c = new DOMNode('c', b);
			/* eslint-enable no-unused-vars */
			const order: string[] = [];
			root.visitDepthFirst((node: DOMNode) => order.push(node.tagName));
			expect(order).to.deep.equal(['a', 'c', 'b', 'root']);
		});

	});

	describe('find()', function(){

		it('should visit all nodes until callback evaluates to true', function(){
			const root = new DOMNode('root');
			/* eslint-disable no-unused-vars */
			const a = new DOMNode('a', root);
			const b = new DOMNode('b', root);
			const c = new DOMNode('c', b);
			/* eslint-enable no-unused-vars */
			const result = root.find((node: DOMNode) => node.tagName === 'b');
			expect(result.tagName).to.equal('b');
		});

	});

});
