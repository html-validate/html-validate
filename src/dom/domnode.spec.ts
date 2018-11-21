import { DOMNode, DOMTree, Attribute, NodeClosed }  from '.';
import { Parser } from '../parser';
import { Config } from '../config';
import { Location } from '../context';
import { Token, TokenType } from '../lexer';
import { MetaTable, MetaElement } from '../meta';

describe('DOMNode', function(){

	let root: DOMTree;
	const location: Location = {filename: 'filename', line: 1, column: 1};

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

	describe('fromTokens()', () => {

		function createTokens(tagName: string, open: boolean = true, selfClose: boolean = false): [Token, Token] {
			const slash = open ? '' : '/';
			const startToken: Token = {type: TokenType.TAG_OPEN, data: [`<${slash}${tagName}`, slash, tagName], location};
			const endToken: Token = {type: TokenType.TAG_CLOSE, data: [selfClose ? '/>' : '>'], location};
			return [startToken, endToken];
		}

		it('should create DOMNode from tokens', () => {
			const [startToken, endToken] = createTokens('foo'); // <foo>
			const node = DOMNode.fromTokens(startToken, endToken, null, null);
			expect(node.nodeName).toEqual('foo');
			expect(node.tagName).toEqual('foo');
			expect(node.location).toEqual(startToken.location);
			expect(node.closed).toEqual(NodeClosed.Open);
		});

		it('should throw error if tagname is missing', () => {
			const [startToken, endToken] = createTokens(''); // <foo>
			expect(() => {
				DOMNode.fromTokens(startToken, endToken, null, null);
			}).toThrow('tagName cannot be empty');
		});

		it('should set parent for opening tag', () => {
			const [startToken1, endToken1] = createTokens('foo', true);  // <foo>
			const [startToken2, endToken2] = createTokens('foo', false); // </foo>
			const parent = new DOMNode('parent');
			const open =  DOMNode.fromTokens(startToken1, endToken1, parent, null);
			const close = DOMNode.fromTokens(startToken2, endToken2, parent, null);
			expect(open.parent).toBeDefined();
			expect(close.parent).toBeUndefined();
		});

		it('should set metadata', () => {
			const [startToken, endToken] = createTokens('foo'); // <foo>
			const foo: MetaElement = mockEntry('foo');
			const table = new MetaTable();
			table.loadFromObject({foo});
			const node = DOMNode.fromTokens(startToken, endToken, null, table);
			expect(node.meta).toEqual(foo);
		});

		it('should set closed for omitted end tag', () => {
			const [startToken, endToken] = createTokens('foo'); // <foo>
			const foo: MetaElement = mockEntry('foo', {void: true});
			const table = new MetaTable();
			table.loadFromObject({foo});
			const node = DOMNode.fromTokens(startToken, endToken, null, table);
			expect(node.closed).toEqual(NodeClosed.VoidOmitted);
		});

		it('should set closed for self-closed end tag', () => {
			const [startToken, endToken] = createTokens('foo', true, true); // <foo/>
			const node = DOMNode.fromTokens(startToken, endToken, null, null);
			expect(node.closed).toEqual(NodeClosed.VoidSelfClosed);
		});

	});

	it('root element', () => {
		const rootElement = root.root;
		expect(rootElement.isRootElement()).toBeTruthy();
		expect(rootElement.nodeName).toEqual('#document');
		expect(rootElement.tagName).toBeUndefined();
	});

	it('id property should return element id', function(){
		const el = new DOMNode('foo');
		el.setAttribute('id', 'bar', location);
		expect(el.id).toEqual('bar');
	});

	it('id property should return null if no id attribute exists', function(){
		const el = new DOMNode('foo');
		expect(el.id).toBeNull();
	});

	it('should be assigned a unique id', function(){
		const n1 = new DOMNode('foo');
		const n2 = new DOMNode('foo');
		expect(n1.unique).toEqual(expect.any(Number));
		expect(n2.unique).toEqual(expect.any(Number));
		expect(n1.unique === n2.unique).toBeFalsy();
	});

	it('append() should add node as child', () => {
		const parent = new DOMNode('parent');
		const child = new DOMNode('child');
		expect(parent.children).toHaveLength(0);
		parent.append(child);
		expect(parent.children).toHaveLength(1);
		expect(parent.children[0].unique).toEqual(child.unique);
	});

	it('hasAttribute()', () => {
		const node = new DOMNode('foo');
		node.setAttribute('foo', '', location);
		expect(node.hasAttribute('foo')).toBeTruthy();
		expect(node.hasAttribute('bar')).toBeFalsy();
	});

	it('getAttribute()', () => {
		const node = new DOMNode('foo');
		node.setAttribute('foo', 'value', location);
		expect(node.getAttribute('foo')).toBeInstanceOf(Attribute);
		expect(node.getAttribute('foo')).toEqual({
			key: 'foo',
			value: 'value',
			location,
		});
		expect(node.getAttribute('bar')).toBeNull();
	});

	describe('classList', () => {

		it('should return list of classes', () => {
			const node = new DOMNode('foo');
			node.setAttribute('class', 'foo bar baz', location);
			expect(Array.from(node.classList)).toEqual(['foo', 'bar', 'baz']);
		});

		it('should return empty list when class is missing', () => {
			const node = new DOMNode('foo');
			expect(Array.from(node.classList)).toEqual([]);
		});

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

function mockEntry(tagName: string, stub = {}): MetaElement {
	return Object.assign({
		tagName,
		metadata: false,
		flow: false,
		sectioning: false,
		heading: false,
		phrasing: false,
		embedded: false,
		interactive: false,
		deprecated: false,
		void: false,
		transparent: false,
		implicitClosed: [],
		attributes: {},
		deprecatedAttributes: [],
		permittedContent: [],
		permittedDescendants: [],
		permittedOrder: [],
	}, stub);
}
