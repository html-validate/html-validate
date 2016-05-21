module.exports = {
	init: function(context){
		context.addListener('tag:close', validate);
	},
};

function validate(node, report){
	if ( Object.keys(node.current.attr).length > 0 ){
		report.error(node, "Close tags cannot have attributes");
	}
}
