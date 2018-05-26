const path = require('path');
import { Config } from './config';

describe('config', function(){

	const expect = require('chai').expect;

	it('should load defaults', function(){
		const config = Config.empty();
		expect(config.get()).to.not.be.undefined;
	});

	it('should contain no rules by default', function(){
		const config = Config.empty();
		expect(Object.keys(config.get().rules)).to.have.lengthOf(0);
	});

	describe('getRules()', function(){

		it('should return parsed rules', function(){
			const config = Config.fromObject({rules: {foo: 'error'}});
			expect(config.get().rules).to.deep.equal({foo: 'error'});
			expect(config.getRules()).to.deep.equal({
				foo: [Config.SEVERITY_ERROR, {}],
			});
		});

		it('getRules() should parse severity from string', function(){
			const config = Config.fromObject({
				rules: {
					foo: 'error',
					bar: 'warn',
					baz: 'disable',
				},
			});
			expect(config.getRules()).to.deep.equal({
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
			expect(config.getRules()).to.deep.equal({
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
			expect(config.getRules()).to.deep.equal({
				foo: [Config.SEVERITY_ERROR, {foo: true}],
				bar: [Config.SEVERITY_ERROR, {bar: false}],
			});
		});

	});

	describe('fromFile()', function(){

		it('should support JSON', function(){
			const config = Config.fromFile(`${process.cwd()}/test-files/config.json`);
			expect(config.getRules()).to.deep.equal({
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
			expect(config.getRules()).to.deep.equal({
				foo: [Config.SEVERITY_WARN, {}],
				bar: [Config.SEVERITY_WARN, {}],
				baz: [Config.SEVERITY_DISABLED, {}],
			});
		});

		it('should support deep extending', function(){
			const config = Config.fromObject({
				extends: [`${process.cwd()}/test-files/config-extending.json`],
			});
			expect(config.getRules()).to.deep.equal({
				foo: [Config.SEVERITY_ERROR, {}],
				bar: [Config.SEVERITY_WARN, {}],
				baz: [Config.SEVERITY_ERROR, {}],
			});
		});

		it('should support htmlvalidate:recommended', function(){
			const config = Config.fromObject({
				extends: ['htmlvalidate:recommended'],
			});
			expect(config.getRules()).to.be.an('object');
		});

	});

	describe('expandRelative()', function(){

		it('should expand ./foo', function(){
			expect(Config.expandRelative('./foo', '/path')).to.equal(path.join(path.sep, 'path', 'foo'));
		});

		it('should expand ../foo', function(){
			expect(Config.expandRelative('../foo', '/path/bar')).to.equal(path.join(path.sep, 'path', 'foo'));
		});

		it('should not expand /foo', function(){
			expect(Config.expandRelative('/foo', '/path')).to.equal('/foo');
		});

		it('should not expand foo', function(){
			expect(Config.expandRelative('foo', '/path')).to.equal('foo');
		});

	});

	describe('getMetaTable()', function(){

		it('should load metadata', function(){
			const config = Config.empty();
			const metatable = config.getMetaTable();
			expect(Object.keys(metatable.elements)).not.to.have.lengthOf(0);
		});

	});

	describe('transform()', () => {

		it('should match filename against transformer', () => {
			const config = Config.fromObject({
				transform: {
					'^.*\\.foo$': '../transform/mock',
				},
			});
			expect(config.transform('/path/to/test.foo')).to.deep.equal({
				data: 'mocked source',
				filename: '/path/to/test.foo',
				line: 1,
				column: 1,
			});
		});

		it('should default to reading full file', () => {
			const config = Config.fromObject({
				transform: {
					'^.*\\.foo$': '../transform/mock',
				},
			});
			expect(config.transform('test-files/parser/simple.html')).to.deep.equal({
				data: '<p>Lorem ipsum</p>\n',
				filename: 'test-files/parser/simple.html',
				line: 1,
				column: 1,
			});
		});

	});

});
