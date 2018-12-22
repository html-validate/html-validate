import { Result } from "../reporter";

function jsonFormatter(results: Result[]){
	return JSON.stringify(results);
}

module.exports = jsonFormatter;
