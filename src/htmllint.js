'use strict';

var Context = require('./context');
var Parser = require('./parser');

class HtmlLint {
	constructor(){
		this.listeners = {};
		this.parser = new Parser();
		this.config = this.globalConfig();
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

	/**
	 * Loads global configuration.
	 */
	globalConfig(){
		// TODO hardcoded config
		return {
			html: {
				voidElements: [
					'area',
					'base',
					'br',
					'col',
					'embed',
					'hr',
					'img',
					'input',
					'keygen',
					'link',
					'menuitem',
					'meta',
					'param',
					'source',
					'track',
					'wbr',
				],
			},
		};
	}

	string(str, report){
		let context = new Context(str, this.listeners);
		context.addRule(require('./rules/close-attr'));
		context.addRule(require('./rules/close-order'));
		return this.parser.parseHtml(str, context, this.config, report);
	}
}

module.exports = HtmlLint;
