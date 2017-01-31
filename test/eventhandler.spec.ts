'use strict';

import EventHandler from '../src/eventhandler';

describe('eventhandler', function(){

	const chai = require('chai');
	const expect = chai.expect;

	chai.use(require('chai-spies'));

	let eventhandler;

	beforeEach(function(){
		eventhandler = new EventHandler();
	});

	it('should call listener on named event', function(){
		let callback = chai.spy();
		eventhandler.on('foo', callback);
		eventhandler.trigger('foo', {bar: true});
		expect(callback).to.have.been.called.once();
		expect(callback).to.have.been.called.with.exactly('foo', {bar: true});
	});

	it('should not call listener on other events', function(){
		let callback = chai.spy();
		eventhandler.on('foo', callback);
		eventhandler.trigger('spam', {bar: true});
		expect(callback).not.to.have.been.called();
	});

	it('should call wildcard listener on any event', function(){
		let callback = chai.spy();
		eventhandler.on('*', callback);
		eventhandler.trigger('foo', {bar: true});
		expect(callback).to.have.been.called.once();
		expect(callback).to.have.been.called.with.exactly('foo', {bar: true});
	});

	it('should pass all arguments to listener', function(){
		let callback = chai.spy();
		eventhandler.on('foo', callback);
		eventhandler.trigger('foo', 1, 2, 3);
		expect(callback).to.have.been.called.once();
		expect(callback).to.have.been.called.with.exactly('foo', 1, 2, 3);
	});

});
