'use strict';

const fs = require('fs');
const Config = require('../build/src/config').default;
const Parser = require('./parser');
const Reporter = require('../build/src/reporter').default;

class HtmlLint {
	constructor(options){
		this.config = new Config(options || {});
	}

	/**
	 * Parse HTML from string.
	 *
	 * @param str {string} - Text to parse.
	 * @return {object} - Report output.
	 */
	string(str){
		return this.parse({data: str, filename: 'inline'});
	}

	/**
	 * Parse HTML from file.
	 *
	 * @param filename {string} - Filename to read and parse.
	 * @return {object} - Report output.
	 */
	file(filename){
		let text = fs.readFileSync(filename, {encoding: 'utf8'});
		return this.parse({data: text, filename});
	}

	/**
	 * Internal parse method.
	 *
	 * @param src {object} - Parse source.
	 * @param src.data {string} - Text HTML data.
	 * @param src.filename {string} - Filename of source for presentation in report.
	 * @return {object} - Report output.
	 */
	parse(src){
		const report = new Reporter();
		const rules = this.config.getRules();
		const parser = new Parser(this.config.get());
		for ( let name in rules ){
			let data = rules[name];
			this.loadRule(name, data, parser, report);
		}

		const dom = parser.parseHtml(src); // eslint-disable-line no-unused-vars

		/* generate results from report */
		return report.save();
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
