'use strict';

module.exports = Reporter;

function Reporter(){
	this.error = [];
}

Reporter.prototype.add = function(node, rule, message, context){
	this.error.push({
		node,
		rule: rule.name,
		message,
		context,
	});
};

Reporter.prototype.save = function(dst){
	if ( typeof(dst) === 'undefined' ) return;
	dst.valid = this.error.length === 0;
	dst.error = this.error;
};
