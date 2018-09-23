/* eslint-disable typescript/no-namespace, prefer-template */

import { Report, Result, Message } from './src/reporter';
import { TokenType } from './src/lexer';
const diff = require('jest-diff');

interface TokenMatcher {
	type: TokenType;
	location?: any;
	data?: any;
}

declare global {
	namespace jest {
		interface Matchers<R> {
			toBeValid(): R;
			toBeInvalid(): R;
			toBeToken(expected: TokenMatcher): R;
			toHaveError(ruleId: string, message: string): R;
			toHaveErrors(errors: [string, string][]): R;
		}
	}
}

function toBeValid(report: Report){
	if (report.valid){
		return {
			pass: true,
			message: () => 'Result should not contain error',
		};
	} else {
		return {
			pass: false,
			message: () => 'Result should be successful',
		};
	}
}

function toBeInvalid(report: Report){
	if (report.valid){
		return {
			pass: false,
			message: () => 'Result should be successful',
		};
	} else {
		return {
			pass: true,
			message: () => 'Result should not contain error',
		};
	}
}

function toHaveError(report: Report, ruleId: any, message: any){
	const actual = report.results.reduce((aggregated: Message[], result: Result) => {
		return aggregated.concat(result.messages);
	}, []);
	const matcher = [expect.objectContaining({ruleId, message})];
	const pass = this.equals(actual, matcher);
	const diffString = diff(matcher, actual, {expand: this.expand});
	const resultMessage = () => this.utils.matcherHint('.toHaveError') +
    '\n\n' +
    `Expected token to equal:\n` +
    `  ${this.utils.printExpected(matcher)}\n` +
    `Received:\n` +
    `  ${this.utils.printReceived(actual)}` +
    (diffString ? `\n\nDifference:\n\n${diffString}` : '');

	return {pass, message: resultMessage};
}

function toHaveErrors(report: Report, errors: ([string, string]|{})[]){
	const actual = report.results.reduce((aggregated: Message[], result: Result) => {
		return aggregated.concat(result.messages);
	}, []);
	const matcher = errors.map((entry) => {
		if (Array.isArray(entry)){
			const [ruleId, message] = entry;
			return expect.objectContaining({ruleId, message});
		} else {
			return expect.objectContaining(entry);
		}
	});
	const pass = this.equals(actual, matcher);
	const diffString = diff(matcher, actual, {expand: this.expand});
	const resultMessage = () => this.utils.matcherHint('.toHaveErrors') +
    '\n\n' +
    `Expected token to equal:\n` +
    `  ${this.utils.printExpected(matcher)}\n` +
    `Received:\n` +
    `  ${this.utils.printReceived(actual)}` +
    (diffString ? `\n\nDifference:\n\n${diffString}` : '');

	return {pass, message: resultMessage};
}

function toBeToken(actual: any, expected: any){
	const token = actual.value;

	if (token.type){
		token.type = TokenType[token.type];
	}

	if (expected.type){
		expected.type = TokenType[expected.type];
	}

	const matcher = expect.objectContaining(expected);
	const pass = this.equals(token, matcher);
	const diffString = diff(matcher, token, {expand: this.expand});
	const message = () => this.utils.matcherHint('.toBeToken') +
    '\n\n' +
    `Expected token to equal:\n` +
    `  ${this.utils.printExpected(matcher)}\n` +
    `Received:\n` +
    `  ${this.utils.printReceived(token)}` +
    (diffString ? `\n\nDifference:\n\n${diffString}` : '');

	return {pass, message};
}

expect.extend({
	toBeValid,
	toBeInvalid,
	toHaveError,
	toHaveErrors,
	toBeToken,
});
