module.exports = {
	init: function(context){
		context.addListener('tag:close', validate);
	},
};

function validate(node){
	if ( node.current.tagName !== node.previous.tagName ){
		console.error('close order wrong');
	}
}
