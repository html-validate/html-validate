const path = require('path');
import { Config } from './config';

describe('config', function(){
	it('should load defaults', function(){
		const config = Config.empty();
		expect(config.get()).toBeDefined();
	});

	it('should contain no rules by default', function(){
		const config = Config.empty();
		expect(Object.keys(config.get().rules)).toHaveLength(0);
	});

	describe('getRules()', function(){

		it('should return parsed rules', function(){
			const config = Config.fromObject({rules: {foo: 'error'}});
			expect(config.get().rules).toEqual({foo: 'error'});
			expect(config.getRules()).toEqual({
				foo: [Config.SEVERITY_ERROR, {}],
			});
		});

		it('getRules() should parse severity from string', function(){
			const config = Config.fromObject({
				rules: {
					foo: 'error',
					bar: 'warn',
					baz: 'off',
				},
			});
			expect(config.getRules()).toEqual({
				foo: [Config.SEVERITY_ERROR, {}],
				bar: [Config.SEVERITY_WARN, {}],
				baz: [Config.SEVERITY_DISABLED, {}],
			});
		});

		it('getRules() should retain severity from integer', function(){
			const config = Config.fromObject({
				rules: {
					foo: 2,
					bar: 1,
					baz: 0,
				},
			});
			expect(config.getRules()).toEqual({
				foo: [Config.SEVERITY_ERROR, {}],
				bar: [Config.SEVERITY_WARN, {}],
				baz: [Config.SEVERITY_DISABLED, {}],
			});
		});

		it('getRules() should retain options', function(){
			const config = Config.fromObject({
				rules: {
					foo: [2, {foo: true}],
					bar: ["error", {bar: false}],
				},
			});
			expect(config.getRules()).toEqual({
				foo: [Config.SEVERITY_ERROR, {foo: true}],
				bar: [Config.SEVERITY_ERROR, {bar: false}],
			});
		});

	});

	describe('fromFile()', function(){

		it('should support JSON', function(){
			const config = Config.fromFile(`${process.cwd()}/test-files/config.json`);
			expect(config.getRules()).toEqual({
				foo: [Config.SEVERITY_ERROR, {}],
				bar: [Config.SEVERITY_WARN, {}],
				baz: [Config.SEVERITY_DISABLED, {}],
			});
		});

	});

	describe('extend', function(){

		it('should extend base configuration', function(){
			const config = Config.fromObject({
				extends: [`${process.cwd()}/test-files/config.json`],
				rules: {
					foo: 1,
				},
			});
			expect(config.getRules()).toEqual({
				foo: [Config.SEVERITY_WARN, {}],
				bar: [Config.SEVERITY_WARN, {}],
				baz: [Config.SEVERITY_DISABLED, {}],
			});
		});

		it('should support deep extending', function(){
			const config = Config.fromObject({
				extends: [`${process.cwd()}/test-files/config-extending.json`],
			});
			expect(config.getRules()).toEqual({
				foo: [Config.SEVERITY_ERROR, {}],
				bar: [Config.SEVERITY_WARN, {}],
				baz: [Config.SEVERITY_ERROR, {}],
			});
		});

		it('should support htmlvalidate:recommended', function(){
			const config = Config.fromObject({
				extends: ['htmlvalidate:recommended'],
			});
			expect(config.getRules()).toBeDefined();
		});

		it('should support htmlvalidate:document', function(){
			const config = Config.fromObject({
				extends: ['htmlvalidate:document'],
			});
			expect(config.getRules()).toBeDefined();
		});

	});

	describe('expandRelative()', function(){

		it('should expand ./foo', function(){
			expect(Config.expandRelative('./foo', '/path')).toEqual(path.join(path.sep, 'path', 'foo'));
		});

		it('should expand ../foo', function(){
			expect(Config.expandRelative('../foo', '/path/bar')).toEqual(path.join(path.sep, 'path', 'foo'));
		});

		it('should not expand /foo', function(){
			expect(Config.expandRelative('/foo', '/path')).toEqual('/foo');
		});

		it('should not expand foo', function(){
			expect(Config.expandRelative('foo', '/path')).toEqual('foo');
		});

	});

	describe('getMetaTable()', function(){

		it('should load metadata', function(){
			const config = Config.empty();
			const metatable = config.getMetaTable();
			expect(Object.keys(metatable.elements)).not.toHaveLength(0);
		});

		it('should load inline metadata', function(){
			const config = Config.fromObject({
				elements: [
					{
						'foo': {},
					},
				],
			});
			const metatable = config.getMetaTable();
			expect(Object.keys(metatable.elements)).toEqual(['foo']);
		});

	});

	describe('transform()', () => {

		it('should match filename against transformer', () => {
			const config = Config.fromObject({
				transform: {
					'^.*\\.foo$': '../transform/mock',
				},
			});
			config.init();
			expect(config.transform('/path/to/test.foo')).toEqual([{
				data: 'mocked source',
				filename: '/path/to/test.foo',
				line: 1,
				column: 1,
			}]);
		});

		it('should replace <rootDir>', () => {
			const config = Config.fromObject({
				transform: {
					'^.*\\.foo$': '<rootDir>/src/transform/mock',
				},
			});
			config.init();
			expect(config.transform('/path/to/test.foo')).toEqual([{
				data: 'mocked source',
				filename: '/path/to/test.foo',
				line: 1,
				column: 1,
			}]);
		});

		it('should default to reading full file', () => {
			const config = Config.fromObject({
				transform: {
					'^.*\\.foo$': '../transform/mock',
				},
			});
			config.init();
			expect(config.transform('test-files/parser/simple.html')).toEqual([{
				data: '<p>Lorem ipsum</p>\n',
				filename: 'test-files/parser/simple.html',
				line: 1,
				column: 1,
			}]);
		});

	});

});
