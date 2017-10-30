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

});

function createResult(filename: string, messages: string[]){
	return {
		filePath: filename,
		messages: messages.map(cur => createMessage(cur)),
	};
}

function createMessage(text: string): Message {
	return {
		ruleId: 'mock',
		severity: 2,
		message: text,
		line: 1,
		column: 1,
	};
}
