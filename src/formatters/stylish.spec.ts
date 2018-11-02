const formatter = require('./stylish');

import { Result } from '../reporter';

describe('stylish formatter', () => {

	it('should generate plaintext', () => {
		const results: Result[] = [
			{filePath: 'regular.html', errorCount: 1, warningCount: 1, messages: [
				{ruleId: 'foo', severity: 2, message: 'An error', line: 1, column: 5},
				{ruleId: 'bar', severity: 1, message: 'A warning', line: 2, column: 4},
			]},
			{filePath: 'edge-cases.html', errorCount: 1, warningCount: 0, messages: [
				{ruleId: 'baz', severity: 2, message: 'Another error', line: 3, column: 3},
			]},
		];
		expect(formatter(results)).toMatchSnapshot();
	});

	it('should empty result', () => {
		const results: Result[] = [];
		expect(formatter(results)).toMatchSnapshot();
	});

	it('should empty messages', () => {
		const results: Result[] = [
			{filePath: 'empty.html', messages: []},
		];
		expect(formatter(results)).toMatchSnapshot();
	});

});
