module.exports = Reporter;

function Reporter(){
	this.errors = [];
}

Reporter.prototype.error = function(node, message){
	this.errors.push({
		node: node,
		message: message,
	});
};

Reporter.prototype.save = function(dst){
	if ( typeof(dst) === 'undefined' ) return;
	dst.valid = this.errors.length === 0;
};
