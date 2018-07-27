import EventHandler from './eventhandler';

describe('eventhandler', function(){

	const chai = require('chai');
	const expect = chai.expect;

	chai.use(require('chai-spies'));

	let eventhandler: EventHandler;

	beforeEach(function(){
		eventhandler = new EventHandler();
	});

	describe('on', function(){

		it('should call listener on named event', function(){
			const callback = chai.spy();
			eventhandler.on('foo', callback);
			eventhandler.trigger('foo', {bar: true});
			eventhandler.trigger('foo', {bar: false});
			expect(callback).to.have.been.called.twice;
			expect(callback).to.have.been.called.with.exactly('foo', {bar: true});
			expect(callback).to.have.been.called.with.exactly('foo', {bar: false});
		});

		it('should not call listener on other events', function(){
			const callback = chai.spy();
			eventhandler.on('foo', callback);
			eventhandler.trigger('spam', {bar: true});
			expect(callback).not.to.have.been.called();
		});

		it('should call wildcard listener on any event', function(){
			const callback = chai.spy();
			eventhandler.on('*', callback);
			eventhandler.trigger('foo', {bar: true});
			expect(callback).to.have.been.called.once;
			expect(callback).to.have.been.called.with.exactly('foo', {bar: true});
		});

		it('should not call listener after deregistration', function(){
			const callback = chai.spy();
			const deregister = eventhandler.on('foo', callback);
			deregister();
			eventhandler.trigger('foo', {bar: true});
			expect(callback).not.to.have.been.called();
		});

		it('should handle multiple events separated by comma', function(){
			const callback = chai.spy();
			eventhandler.on('foo, bar', callback);
			eventhandler.trigger('foo', {bar: 1});
			eventhandler.trigger('bar', {bar: 2});
			expect(callback).to.have.been.called.twice;
			expect(callback).to.have.been.called.with.exactly('foo', {bar: 1});
			expect(callback).to.have.been.called.with.exactly('bar', {bar: 2});
		});

	});

	describe('once', function(){

		it('should call listener only once', function(){
			const callback = chai.spy();
			eventhandler.once('foo', callback);
			eventhandler.trigger('foo', {bar: true});
			eventhandler.trigger('foo', {bar: false});
			expect(callback).to.have.been.called.once;
			expect(callback).to.have.been.called.with.exactly('foo', {bar: true});
		});

		it('should not call listener after deregistration', function(){
			const callback = chai.spy();
			const deregister = eventhandler.once('foo', callback);
			deregister();
			eventhandler.trigger('foo', {bar: true});
			expect(callback).not.to.have.been.called();
		});

	});

});
