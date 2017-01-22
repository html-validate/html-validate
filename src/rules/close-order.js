module.exports = {
	name: 'close-order',

	init: function(context){
		context.addListener('tag:close', this, validate);
	},
};

function validate(event, report){
	var current = event.current;
	var previous = event.previous;
	if ( current.tagName !== previous.tagName ){
		report(current, "Mismatched close-tag, expected '</" + previous.tagName + ">' but found '</" + current.tagName + ">'.");
	}
}
