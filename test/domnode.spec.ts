import DOMNode from '../src/domnode';
import DOMTree from '../src/domtree';
import Parser from '../src/parser';
import Config from '../src/config';

describe('DOMNode', function(){

	const expect = require('chai').expect;
	let root: DOMTree;

	beforeEach(() => {
		const parser = new Parser(Config.empty());
		root = parser.parseHtml(`<div id="parent">
			<ul>
				<li class="foo">foo</li>
				<li class="bar baz" id="spam" title="ham">bar</li>
			</ul>
			<p class="bar">spam</p>
		</div>`);
	});

	describe('is()', function(){

		it('should match tagname', function(){
			const el = new DOMNode('foo');
			expect(el.is('foo')).to.be.true;
			expect(el.is('bar')).to.be.false;
		});

		it('should match any tag when using asterisk', function(){
			const el = new DOMNode('foo');
			expect(el.is('*')).to.be.true;
		});

	});

	describe('getElementsByTagName()', function(){

		it('should find elements', function(){
			const nodes = root.getElementsByTagName('li');
			expect(nodes).to.have.lengthOf(2);
			expect(nodes[0].getAttribute('class')).to.equal('foo');
			expect(nodes[1].getAttribute('class')).to.equal('bar baz');
		});

		it('should support universal selector', function(){
			const tagNames = root.getElementsByTagName('*').map((cur: DOMNode) => cur.tagName);
			expect(tagNames).to.have.lengthOf(5);
			expect(tagNames).to.deep.equal(['div', 'ul', 'li', 'li', 'p']);
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
