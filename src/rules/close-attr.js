module.exports = {
	init: function(context){
		context.addListener('tag:close', validate);
	},
};

function validate(node){
	if ( Object.keys(node.current.attr).length > 0 ){
		console.error('close tags cannot have attributes');
	}
}
