'use strict';

const Config = require('./config');
const Context = require('./context');
const Parser = require('./parser');

class HtmlLint {
	constructor(options){
		this.listeners = {};
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
		this.listeners[event] = this.listeners[event] || [];
		this.listeners[event].push(callback);
	}

	string(str, report){
		let context = new Context(str, this.listeners);
		var rules = this.config.getRules();
		for ( let name in rules ){
			var ruleOptions = rules[name];
			if ( ruleOptions[0] >= Config.SEVERITY_WARN ){
				context.addRule(require('./rules/' + name), ruleOptions[1]);
			}
		}
		return this.parser.parseHtml(str, context, this.config.get(), report);
	}
}

module.exports = HtmlLint;
