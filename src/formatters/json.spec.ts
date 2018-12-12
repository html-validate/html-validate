const formatter = require('./json');
import { Result } from '../reporter';

describe('json formatter', () => {

	it('should generate json', () => {
		const results: Result[] = [
			{filePath: 'regular.html', messages: [
				{ruleId: 'foo', severity: 2, message: 'An error',  offset: 4,  line: 1, column: 5},
				{ruleId: 'bar', severity: 1, message: 'A warning', offset: 12, line: 2, column: 4},
			]},
			{filePath: 'edge-cases.html', messages: [
				{ruleId: 'baz', severity: 2, message: 'Another error', offset: 14, line: 3, column: 3},
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
