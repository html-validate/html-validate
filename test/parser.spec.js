'use strict';

var expect = require('chai').expect;
var htmllint = require('../src/htmllint');

describe('parser', function(){

	describe('should parse', function(){

		var events;

		before(function(){
			htmllint.addListener('*', function(event, node){
				events.push({
					event: event,
					tagName: node.tagName,
				});
			});
		});

		beforeEach(function(){
			events = [];
		});

		it('simple element', function(){
			expect(htmllint.string('<div></div>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events[0]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[1]).to.deep.equal({event: 'tag:close', tagName: undefined});
		});

		it('elements closed on wrong order', function(){
			expect(htmllint.string('<div><p></div></p>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events[0]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[1]).to.deep.equal({event: 'tag:open', tagName: 'p'});
			expect(events[2]).to.deep.equal({event: 'tag:close', tagName: undefined});
			expect(events[3]).to.deep.equal({event: 'tag:close', tagName: undefined});
		});

	});

});
