import { Reporter, Message } from './reporter';

const expect = require('chai').expect;

describe('Reporter', function(){

	describe('merge()', function(){

		it('should set valid only if all reports are valid', function(){
			const none = Reporter.merge([{valid: false, results: []}, {valid: false, results: []}]);
			const one = Reporter.merge([{valid: true, results: []}, {valid: false, results: []}]);
			const all = Reporter.merge([{valid: true, results: []}, {valid: true, results: []}]);
			expect(none.valid).to.be.false;
			expect(one.valid).to.be.false;
			expect(all.valid).to.be.true;
		});

		it('should merge and group messages by filename', function(){
			const merged = Reporter.merge([
				{
					valid: false,
					results: [
						createResult('foo', ['fred', 'barney']),
						createResult('bar', ['spam']),
					],
				},
				{
					valid: false,
					results: [
						createResult('foo', ['wilma']),
					],
				},
			]);
			expect(merged.results).to.have.length(2);
			expect(merged.results[0].filePath).to.equal('foo');
			expect(merged.results[0].messages.map(x => x.message)).to.deep.equal(['fred', 'barney', 'wilma']);
			expect(merged.results[1].filePath).to.equal('bar');
			expect(merged.results[1].messages.map(x => x.message)).to.deep.equal(['spam']);
		});

	});

	describe('save()', () => {

		it('should set valid to true if there are no errors', () => {
			const report = new Reporter();
			expect(report.save().valid).to.be.true;
		});

		it('should set valid to true if there are only warnings', () => {
			const report = new Reporter();
			report.addManual("filename", createMessage("warning", 1));
			expect(report.save().valid).to.be.true;

		});

		it('should set valid to false if there are any errors', () => {
			const report = new Reporter();
			report.addManual("filename", createMessage("error", 2));
			expect(report.save().valid).to.be.false;
		});

		it('should set results', () => {
			const report = new Reporter();
			report.addManual("foo.html", createMessage("error", 2));
			report.addManual("foo.html", createMessage("warning", 1));
			report.addManual("bar.html", createMessage("another error", 2));
			expect(report.save().results).to.deep.equal([
				{filePath: 'foo.html', errorCount: 1, warningCount: 1, messages: [
					{line: 1, column: 1, ruleId: 'mock', severity: 2, message: 'error'},
					{line: 1, column: 1, ruleId: 'mock', severity: 1, message: 'warning'},
				]},
				{filePath: 'bar.html', errorCount: 1, warningCount: 0, messages: [
					{line: 1, column: 1, ruleId: 'mock', severity: 2, message: 'another error'},
				]},
			]);
		});

	});

});

function createResult(filename: string, messages: string[]){
	return {
		filePath: filename,
		messages: messages.map(cur => createMessage(cur)),
	};
}

function createMessage(message: string, severity: number = 2): Message {
	return {
		ruleId: 'mock',
		severity,
		message,
		line: 1,
		column: 1,
	};
}
