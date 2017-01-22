module.exports = Context;

var Reporter = require('./reporter');

function Context(str){
	this.report = new Reporter();
	this.state = 0;
	this.string = str;
	this.stack = [];
	this.listeners = {};
}

Context.prototype.match = function(x){
	return this.string.match(x);
};

Context.prototype.consume = function(n, state){
	if ( typeof(n) !== 'number' ){
		n = n[0].length; /* regex match */
	}
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

Context.prototype.addRule = function(rule){
	rule.init(this);
};

Context.prototype.addListener = function(event, rule, callback){
	this.listeners[event] = this.listeners[event] || [];
	this.listeners[event].push({
		rule: rule,
		callback: callback,
	});
};

Context.prototype.trigger = function(event, data){
	var report = this.report;
	var listeners = this.listeners[event] || [];
	listeners.forEach(function(listener){
		var rule = listener.rule;
		listener.callback.call(rule, data, function(node, message){
			report.add(node, rule, message);
		});
	});
};

Context.prototype.saveReport = function(dst){
	this.report.save(dst);
};
