module.exports = {
	init: function(context){
		context.addListener('tag:close', validate);
	},
};

function validate(event, report){
	var current = event.current;
	var previous = event.previous;
	if ( current.tagName !== previous.tagName ){
		report.error(current, "Mismatched close-tag, expected '</" + previous.tagName + ">' but found '</" + current.tagName + ">'.");
	}
}
