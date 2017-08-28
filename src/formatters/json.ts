import { Result } from '../reporter';

function jsonFormatter(results: Array<Result>){
	return JSON.stringify(results);
}

module.exports = jsonFormatter;
