'use strict';

module.exports = Context;

var EventHandler = require('./eventhandler');

function Context(src, globalListeners){
	this.state = undefined;
	this.string = src.data;
	this.filename = src.filename;
	this.line = 1;
	this.column = 1;
	this.stack = [];
	this.event = new EventHandler();
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

Context.prototype.addListener = function(event, rule, callback){
	this.event.on(event, function(){
		callback.apply(rule, arguments); /* event handler rebinds this */
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
	this.event.trigger(eventname, event, function(node, message){
		report.add(node, this, message, context);
	});

	/* execute any global listener */
	this.globalevents.trigger(eventname, event);
};

Context.prototype.saveReport = function(dst){
	this.report.save(dst);
};

Context.prototype.getContextData = function(){
	return `${this.filename}:${this.line}:${this.column}`;
};
