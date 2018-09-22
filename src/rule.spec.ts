import { Config } from './config';
import { DOMNode } from './dom';
import { Parser } from './parser';
import { Reporter } from './reporter';
import { Rule } from './rule';

class MockRule extends Rule {
	setup(){

	}
}

describe('rule base class', function(){

	let parser: Parser;
	let reporter: Reporter;
	let rule: Rule;

	beforeEach(function(){
		parser = new Parser(Config.empty());
		parser.on = jest.fn();
		reporter = new Reporter();
		reporter.add = jest.fn();

		rule = new MockRule({});
	});

	describe('report()', function(){

		it('should not add message with severity "disabled"', function(){
			rule.init(parser, reporter, Config.SEVERITY_DISABLED);
			rule.report(null, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it('should add message with severity "warn"', function(){
			const node = new DOMNode("foo", null);
			rule.init(parser, reporter, Config.SEVERITY_WARN);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_WARN, expect.anything());
		});

		it('should add message with severity "error"', function(){
			const node = new DOMNode("foo", null);
			rule.init(parser, reporter, Config.SEVERITY_ERROR);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, expect.anything());
		});

		it('should use explicit location if provided', function(){
			const location = {filename: 'filename', line: 1, column: 2};
			const node = new DOMNode("foo", null);
			rule.init(parser, reporter, Config.SEVERITY_ERROR);
			rule.report(node, "foo", location);
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, location);
		});

		it('should use event location if no explicit location', function(){
			const location = {filename: 'filename', line: 1, column: 2};
			const node = new DOMNode("foo", null);
			rule.init(parser, reporter, Config.SEVERITY_ERROR);
			rule.on('*', () => {});
			const callback = (parser.on as any).mock.calls[0][1];
			callback('event', {location});
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, location);
		});

		it('should use node location if no node location', function(){
			const location = {filename: 'filename', line: 1, column: 2};
			const node = new DOMNode("foo", null, undefined, null, location);
			rule.init(parser, reporter, Config.SEVERITY_ERROR);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, location);
		});

	});

	describe('on()', function(){

		let delivered = false;

		it('should not deliver events with severity "disabled"', function(){
			rule.init(parser, reporter, Config.SEVERITY_DISABLED);
			rule.on('*', () => {
				delivered = true;
			});
			const callback = (parser.on as any).mock.calls[0][1];
			callback('event', {location: {}});
			expect(delivered).toBeFalsy();
		});

		it('should deliver events with severity "warn"', function(){
			rule.init(parser, reporter, Config.SEVERITY_WARN);
			rule.on('*', () => {
				delivered = true;
			});
			const callback = (parser.on as any).mock.calls[0][1];
			callback('event', {location: {}});
			expect(delivered).toBeTruthy();
		});

		it('should deliver events with severity "error"', function(){
			rule.init(parser, reporter, Config.SEVERITY_ERROR);
			rule.on('*', () => {
				delivered = true;
			});
			const callback = (parser.on as any).mock.calls[0][1];
			callback('event', {location: {}});
			expect(delivered).toBeTruthy();
		});

	});

});
