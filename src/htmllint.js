'use strict';

const fs = require('fs');
const Config = require('./config');
const Context = require('./context');
const Parser = require('./parser');
const EventHandler = require('./eventhandler');

class HtmlLint {
	constructor(options){
		this.event = new EventHandler();
		this.parser = new Parser();
		this.config = new Config(options || {});
	}

	/**
	 * Add a global event listener.
	 *
	 * @param event [string] - Event name or '*' for any event
	 * @param callback [function] - Called any time even triggers
	 */
	addListener(event, callback){
		this.event.on(event, callback);
	}

	/**
	 * Parse HTML from string.
	 *
	 * @param str {string} - Text to parse.
	 * @param [report] {object} - Report output.
	 */
	string(str, report){
		return this.parse({data: str, filename: '-'}, report);
	}

	/**
	 * Parse HTML from file.
	 *
	 * @param filename {string} - Filename to read and parse.
	 * @param [report] {object} - Report output.
	 */
	file(filename, report){
		var text = fs.readFileSync(filename, {encoding: 'utf8'});
		return this.parse({data: text, filename}, report);
	}

	/**
	 * Internal parse method.
	 *
	 * @param src {object} - Parse source.
	 * @param src.data {string} - Text HTML data.
	 * @param src.filename {string} - Filename of source for presentation in report.
	 * @param [report] {object} - Report output.
	 */
	parse(src, report){
		const context = new Context(src, this.event);
		const rules = this.config.getRules();
		for ( let name in rules ){
			var ruleOptions = rules[name];
			if ( ruleOptions[0] >= Config.SEVERITY_WARN ){
				context.addRule(require('./rules/' + name), ruleOptions[1]);
			}
		}
		return this.parser.parseHtml(src.data, context, this.config.get(), report);
	}

}

module.exports = HtmlLint;
