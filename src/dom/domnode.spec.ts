import { DOMNode, DOMTree }  from '.';
import { Parser } from '../parser';
import { Config } from '../config';

describe('DOMNode', function(){

	let root: DOMTree;

	beforeEach(() => {
		const parser = new Parser(Config.empty());
		root = parser.parseHtml(`<div id="parent">
			<ul>
				<li class="foo">foo</li>
				<li class="bar baz" id="spam" title="ham">bar</li>
			</ul>
			<p class="bar">spam</p>
			<span class="baz">flux</span>
		</div>`);
	});

	it('id property should return element id', function(){
		const el = new DOMNode('foo');
		el.setAttribute('id', 'bar');
		expect(el.id).toEqual('bar');
	});

	it('should be assigned a unique id', function(){
		const n1 = new DOMNode('foo');
		const n2 = new DOMNode('foo');
		expect(n1.unique).toEqual(expect.any(Number));
		expect(n2.unique).toEqual(expect.any(Number));
		expect(n1.unique === n2.unique).toBeFalsy();
	});

	describe('should calculate depth', function(){

		it('for nodes without parent', function(){
			const node = new DOMNode('foo');
			expect(node.depth).toEqual(0);
		});

		it('for nodes in a tree', function(){
			expect(root.querySelector('#parent').depth).toEqual(0);
			expect(root.querySelector('ul').depth).toEqual(1);
			expect(root.querySelector('li.foo').depth).toEqual(2);
			expect(root.querySelector('li.bar').depth).toEqual(2);
		});

	});

	describe('is()', function(){

		it('should match tagname', function(){
			const el = new DOMNode('foo');
			expect(el.is('foo')).toBeTruthy();
			expect(el.is('bar')).toBeFalsy();
		});

		it('should match any tag when using asterisk', function(){
			const el = new DOMNode('foo');
			expect(el.is('*')).toBeTruthy();
		});

	});

	describe('getElementsByTagName()', function(){

		it('should find elements', function(){
			const nodes = root.getElementsByTagName('li');
			expect(nodes).toHaveLength(2);
			expect(nodes[0].getAttributeValue('class')).toEqual('foo');
			expect(nodes[1].getAttributeValue('class')).toEqual('bar baz');
		});

		it('should support universal selector', function(){
			const tagNames = root.getElementsByTagName('*').map((cur: DOMNode) => cur.tagName);
			expect(tagNames).toHaveLength(6);
			expect(tagNames).toEqual(['div', 'ul', 'li', 'li', 'p', 'span']);
		});

	});

	describe('querySelector()', () => {

		it('should find element by tagname', () => {
			const el = root.querySelector('ul');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('ul');
		});

		it('should find element by #id', () => {
			const el = root.querySelector('#parent');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('div');
			expect(el.getAttributeValue('id')).toEqual('parent');
		});

		it('should find element by .class', () => {
			const el = root.querySelector('.foo');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('li');
			expect(el.getAttributeValue('class')).toEqual('foo');
		});

		it('should find element by [attr]', () => {
			const el = root.querySelector('[title]');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('li');
			expect(el.getAttributeValue('class')).toEqual('bar baz');
		});

		it('should find element by [attr=".."]', () => {
			const el = root.querySelector('[class="foo"]');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('li');
			expect(el.getAttributeValue('class')).toEqual('foo');
		});

		it('should find element by multiple selectors', () => {
			const el = root.querySelector('.bar.baz#spam');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('li');
			expect(el.getAttributeValue('class')).toEqual('bar baz');
		});

		it('should find element with descendant combinator', () => {
			const el = root.querySelector('ul .bar');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('li');
			expect(el.getAttributeValue('class')).toEqual('bar baz');
		});

		it('should find element with child combinator', () => {
			const el = root.querySelector('div > .bar');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('p');
			expect(el.getAttributeValue('class')).toEqual('bar');
		});

		it('should find element with adjacent sibling combinator', () => {
			const el = root.querySelector('li + li');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('li');
			expect(el.getAttributeValue('class')).toEqual('bar baz');
		});

		it('should find element with general sibling combinator', () => {
			const el = root.querySelector('ul ~ .baz');
			expect(el).toBeInstanceOf(DOMNode);
			expect(el.tagName).toEqual('span');
			expect(el.getAttributeValue('class')).toEqual('baz');
		});

	});

	describe('querySelectorAll()', () => {

		it('should find multiple elements', () => {
			const el = root.querySelectorAll('.bar');
			expect(el).toHaveLength(2);
			expect(el[0]).toBeInstanceOf(DOMNode);
			expect(el[1]).toBeInstanceOf(DOMNode);
			expect(el[0].tagName).toEqual('li');
			expect(el[1].tagName).toEqual('p');
		});

	});

	describe('visitDepthFirst()', function(){

		it('should visit all nodes in correct order', function(){
			const root = DOMNode.rootNode({
				filename: 'inline',
				line: 1,
				column: 1,
			});
			/* eslint-disable no-unused-vars */
			const a = new DOMNode('a', root);
			const b = new DOMNode('b', root);
			const c = new DOMNode('c', b);
			/* eslint-enable no-unused-vars */
			const order: string[] = [];
			root.visitDepthFirst((node: DOMNode) => order.push(node.tagName));
			expect(order).toEqual(['a', 'c', 'b']);
		});

	});

	describe('someChildren()', function(){

		it('should return true if any child node evaluates to true', function(){
			const root = new DOMNode('root');
			/* eslint-disable no-unused-vars */
			const a = new DOMNode('a', root);
			const b = new DOMNode('b', root);
			const c = new DOMNode('c', b);
			/* eslint-enable no-unused-vars */
			const result = root.someChildren((node: DOMNode) => node.tagName === 'c');
			expect(result).toBeTruthy();
		});

		it('should return false if no child node evaluates to true', function(){
			const root = new DOMNode('root');
			/* eslint-disable no-unused-vars */
			const a = new DOMNode('a', root);
			const b = new DOMNode('b', root);
			const c = new DOMNode('c', b);
			/* eslint-enable no-unused-vars */
			const result = root.someChildren(() => false);
			expect(result).toBeFalsy();
		});

		it('should short-circuit when first node evalutes to true', function(){
			const root = new DOMNode('root');
			/* eslint-disable no-unused-vars */
			const a = new DOMNode('a', root);
			const b = new DOMNode('b', root);
			const c = new DOMNode('c', b);
			/* eslint-enable no-unused-vars */
			const order: string[] = [];
			root.someChildren((node: DOMNode) => {
				order.push(node.tagName);
				return node.tagName === 'a';
			});
			expect(order).toEqual(['a']);
		});

	});

	describe('everyChildren()', function(){

		it('should return true if all nodes evaluates to true', function(){
			const root = new DOMNode('root');
			/* eslint-disable no-unused-vars */
			const a = new DOMNode('a', root);
			const b = new DOMNode('b', root);
			const c = new DOMNode('c', b);
			/* eslint-enable no-unused-vars */
			const result = root.everyChildren(() => true);
			expect(result).toBeTruthy();
		});

		it('should return false if any nodes evaluates to false', function(){
			const root = new DOMNode('root');
			/* eslint-disable no-unused-vars */
			const a = new DOMNode('a', root);
			const b = new DOMNode('b', root);
			const c = new DOMNode('c', b);
			/* eslint-enable no-unused-vars */
			const result = root.everyChildren((node: DOMNode) => node.tagName !== 'b');
			expect(result).toBeFalsy();
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
			expect(result.tagName).toEqual('b');
		});

	});

});
