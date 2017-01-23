'use strict';

var expect = require('chai').expect;
var HtmlLint = require('../src/htmllint');

describe('parser', function(){

	describe('should parse', function(){

		var events;
		var htmllint;

		before(function(){
			htmllint = new HtmlLint();
			htmllint.addListener('*', function(event){
				events.push({
					event: event.event,
					tagName: event.target ? event.target.tagName : undefined,
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
			expect(events[1]).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('elements closed on wrong order', function(){
			expect(htmllint.string('<div><p></div></p>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events[0]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[1]).to.deep.equal({event: 'tag:open', tagName: 'p'});
			expect(events[2]).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events[3]).to.deep.equal({event: 'tag:close', tagName: 'p'});
		});

		it('self-closing elements', function(){
			expect(htmllint.string('<input/>')).to.be.true;
		});

	});

});
