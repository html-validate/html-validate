import { Config } from './config';
import { DOMNode } from './dom';
import { Parser } from './parser';
import { Reporter } from './reporter';
import { Rule } from './rule';
import { Event } from './event';
import { Location } from './context';

class MockRule extends Rule {
	setup(){

	}
}

describe('rule base class', function(){

	let parser: Parser;
	let reporter: Reporter;
	let rule: Rule;
	let mockLocation: Location;
	let mockEvent: Event;

	beforeEach(function(){
		parser = new Parser(Config.empty());
		parser.on = jest.fn();
		reporter = new Reporter();
		reporter.add = jest.fn();

		rule = new MockRule({});
		rule.init(parser, reporter, Config.SEVERITY_ERROR);
		mockLocation = {filename: 'mock-file', offset: 1, line: 1, column: 2};
		mockEvent = {
			location: mockLocation,
		};
	});

	describe('report()', function(){

		it('should not add message with severity "disabled"', function(){
			rule.setServerity(Config.SEVERITY_DISABLED);
			rule.report(null, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it('should add message with severity "warn"', function(){
			const node = new DOMNode("foo", null);
			rule.setServerity(Config.SEVERITY_WARN);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_WARN, expect.anything());
		});

		it('should add message with severity "error"', function(){
			const node = new DOMNode("foo", null);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, expect.anything());
		});

		it('should not add message when disabled', function(){
			rule.setEnabled(false);
			rule.report(null, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it('should use explicit location if provided', function(){
			const node = new DOMNode("foo", null);
			rule.report(node, "foo", mockLocation);
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, mockLocation);
		});

		it('should use event location if no explicit location', function(){
			const node = new DOMNode("foo", null);
			rule.on('*', () => {});
			const callback = (parser.on as any).mock.calls[0][1];
			callback('event', mockEvent);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, mockEvent.location);
		});

		it('should use node location if no node location', function(){
			const node = new DOMNode("foo", null, undefined, null, mockLocation);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, mockLocation);
		});

	});

	describe('on()', function(){

		let delivered: boolean;
		let callback: (event: string, data: Event) => void;

		beforeEach(function(){
			delivered = false;
			rule.on('*', () => {
				delivered = true;
			});
			callback = (parser.on as any).mock.calls[0][1];
		});

		it('should not deliver events with severity "disabled"', function(){
			rule.setServerity(Config.SEVERITY_DISABLED);
			callback('event', mockEvent);
			expect(delivered).toBeFalsy();
		});

		it('should deliver events with severity "warn"', function(){
			rule.setServerity(Config.SEVERITY_WARN);
			callback('event', mockEvent);
			expect(delivered).toBeTruthy();
		});

		it('should deliver events with severity "error"', function(){
			rule.setServerity(Config.SEVERITY_ERROR);
			callback('event', mockEvent);
			expect(delivered).toBeTruthy();
		});

		it('should not deliver events when disabled', function(){
			rule.setEnabled(false);
			callback('event', mockEvent);
			expect(delivered).toBeFalsy();
		});

	});

});
