const formatter = require('./checkstyle');
import { Result } from '../reporter';

describe('checkstyle formatter', () => {

	it('should generate checkstyle xml', () => {
		const results: Result[] = [
			{filePath: 'regular.html', messages: [
				{ruleId: 'foo', severity: 2, message: 'An error',  offset: 4,  line: 1, column: 5, size: 1},
				{ruleId: 'bar', severity: 1, message: 'A warning', offset: 12, line: 2, column: 4, size: 1},
			]},
			{filePath: 'edge-cases.html', messages: [
				{ruleId: 'foo', severity: 3, message: 'Has invalid severity', offset: 0, line: 1, column: 1, size: 1},
				{ruleId: 'bar', severity: 2, message: `Escape <script language="jabbascript"> & <span id='foo'>`, offset: 14, line: 2, column: 2, size: 1},
				{ruleId: undefined, severity: 2, message: 'Missing fields', offset: NaN, line: undefined, column: null, size: undefined},
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
