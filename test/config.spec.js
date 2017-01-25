'use strict';

var expect = require('chai').expect;
var Config = require('../src/config');

describe('config', function(){

	it('should load defaults', function(){
		var config = new Config();
		expect(config.get()).to.not.be.undefined;
	});

	it('should contain void elements by default', function(){
		var config = new Config();
		expect(config.get().html.voidElements).not.to.have.lengthOf(0);
	});

	it('should contain no rules by default', function(){
		var config = new Config();
		expect(Object.keys(config.get().rules)).to.have.lengthOf(0);
	});

	it('constructor should deep-merge options', function(){
		var config = new Config({
			foo: 'bar',
			html: {
				spam: 'ham',
			},
		});
		expect(config.get().foo).to.equal('bar');
		expect(config.get().html.spam).to.equal('ham');
		expect(config.get().html.voidElements).not.to.have.lengthOf(0);
	});

	it('getRules() should parsed rules', function(){
		var unparsedRules = {
			foo: 'error',
			bar: 'warn',
			baz: 'disable',
			fred: 2,
			barney: 1,
			wilma: 0,
		};
		var config = new Config({
			rules: unparsedRules,
		});
		expect(config.get().rules).to.deep.equal(unparsedRules);
		expect(config.getRules()).to.deep.equal({
			foo: Config.SEVERITY_ERROR,
			bar: Config.SEVERITY_WARN,
			baz: Config.SEVERITY_DISABLED,
			fred: Config.SEVERITY_ERROR,
			barney: Config.SEVERITY_WARN,
			wilma: Config.SEVERITY_DISABLED,
		});
	});

});
