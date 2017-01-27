'use strict';

module.exports = Context;

var Reporter = require('./reporter');

function Context(src, globalListeners){
	this.report = new Reporter();
	this.state = 0;
	this.string = src.data;
	this.filename = src.filename;
	this.line = 1;
	this.column = 1;
	this.stack = [];
	this.listeners = {};
	this.globalListeners = globalListeners;
}

Context.prototype.match = function(x){
	return this.string.match(x);
};

Context.prototype.consume = function(n, state){
	if ( typeof(n) !== 'number' ){
		n = n[0].length; /* regex match */
	}

	/* poor mans line counter :( */
	let consumed = this.string.slice(0, n);
	let offset;
	while ( (offset=consumed.indexOf('\n')) >= 0 ){
		this.line++;
		this.column = 1;
		consumed = consumed.substr(offset + 1);
	}
	this.column += consumed.length;

	this.string = this.string.substr(n);

	if ( typeof(state) !== 'undefined' ){
		this.state = state;
	}
};

Context.prototype.push = function(node){
	this.stack.push(node);
};

Context.prototype.pop = function(){
	return this.stack.pop();
};

Context.prototype.top = function(n){
	n = n || 0;
	return this.stack[this.stack.length - (1 + n)];
};

Context.prototype.addRule = function(rule, options){
	rule.init(this, options);
};

Context.prototype.addListener = function(event, rule, callback){
	this.listeners[event] = this.listeners[event] || [];
	this.listeners[event].push({
		rule: rule,
		callback: callback,
	});
};

Context.prototype.trigger = function(eventname, data){
	const report = this.report;
	const event = Object.assign({event: eventname}, data);
	const context = {
		filename: this.filename,
		line: this.line,
		column: this.column,
	};

	/* execute rule listeners */
	var listeners = this.listeners[eventname] || [];
	listeners.forEach(function(listener){
		var rule = listener.rule;
		listener.callback.call(rule, data, function(node, message){
			report.add(node, rule, message, context);
		});
	});

	/* execute any global listener */
	var globalListeners = [].concat(this.globalListeners[eventname] || [], this.globalListeners['*'] || []);
	globalListeners.forEach(function(listener){
		listener(event);
	});
};

Context.prototype.saveReport = function(dst){
	this.report.save(dst);
};

Context.prototype.getContextData = function(){
	return `${this.filename}:${this.line}:${this.column}`;
};
