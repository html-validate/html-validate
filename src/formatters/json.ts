/* eslint-disable no-unused-vars */
import { Result } from '../reporter';
/* eslint-enable no-unused-vars */

function jsonFormatter(results: Result[]){
	return JSON.stringify(results);
}

module.exports = jsonFormatter;
