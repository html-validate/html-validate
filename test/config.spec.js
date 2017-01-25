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

});
