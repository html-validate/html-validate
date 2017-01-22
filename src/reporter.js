module.exports = Reporter;

function Reporter(){
	this.error = [];
}

Reporter.prototype.add = function(node, rule, message){
	this.error.push({
		node: node,
		rule: rule.name,
		message: message,
	});
};

Reporter.prototype.save = function(dst){
	if ( typeof(dst) === 'undefined' ) return;
	dst.valid = this.error.length === 0;
	dst.error = this.error;
};
