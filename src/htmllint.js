'use strict';

const fs = require('fs');
const Config = require('./config');
const Context = require('./context');
const Parser = require('./parser');
const EventHandler = require('./eventhandler');
const Reporter = require('./reporter');

class HtmlLint {
	constructor(options){
		this.event = new EventHandler();
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
	 * @param [result] {object} - Report output.
	 */
	parse(src, result){
		const report = new Reporter();
		const rules = this.config.getRules();
		const parser = new Parser(this.config.get());
		for ( let name in rules ){
			let data = rules[name];
			this.loadRule(name, data, parser, report);
		}

		const dom = parser.parseHtml(src.data); // eslint-disable-line no-unused-vars

		/* generate results from report */
		report.save(result);

		return true;
	}

	loadRule(name, data, parser, report){
		let severity = data[0];
		let options = data[1];
		if ( severity >= Config.SEVERITY_WARN ){
			let rule = require('./rules/' + name);
			rule.init(this.createProxy(parser, rule, report), options);
		}
	}

	/**
	 * Create a proxy event binding: parser <-- rule --> report
	 *
	 * Rule can bind events on parser while maintaining "this" bound to the rule.
	 * Callbacks receives an additional argument "report" to write messages to.
	 */
	createProxy(parser, rule, report){
		return {
			on: function(event, callback){
				parser.on(event, function(event, data){
					callback.call(rule, data, function(node, message){
						report.add(node, rule, message, data.location);
					});
				});
			},
		};
	}
}

module.exports = HtmlLint;
