module.exports = {
	name: 'close-attr',

	init: function(context){
		context.addListener('tag:close', this, validate);
	},
};

function validate(node, report){
	if ( Object.keys(node.target.attr).length > 0 ){
		report(node, "Close tags cannot have attributes");
	}
}
