import Config from '../src/config';

describe('config', function(){

	const expect = require('chai').expect;

	it('should load defaults', function(){
		let config = Config.empty();
		expect(config.get()).to.not.be.undefined;
	});

	it('should contain void elements by default', function(){
		let config = Config.empty();
		expect(config.get().html.voidElements).not.to.have.lengthOf(0);
	});

	it('should contain no rules by default', function(){
		let config = Config.empty();
		expect(Object.keys(config.get().rules)).to.have.lengthOf(0);
	});

	it('constructor should deep-merge options', function(){
		let config = Config.fromObject({
			foo: 'bar',
			html: {
				spam: 'ham',
			},
		});
		expect(config.get().foo).to.equal('bar');
		expect(config.get().html.spam).to.equal('ham');
		expect(config.get().html.voidElements).not.to.have.lengthOf(0);
	});

	describe('getRules()', function(){

		it('should return parsed rules', function(){
			let config = Config.fromObject({rules: {foo: 'error'}});
			expect(config.get().rules).to.deep.equal({foo: 'error'});
			expect(config.getRules()).to.deep.equal({
				foo: [Config.SEVERITY_ERROR, {}],
			});
		});

		it('getRules() should parse severity from string', function(){
			let config = Config.fromObject({
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
			let config = Config.fromObject({
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
			let config = Config.fromObject({
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

});
