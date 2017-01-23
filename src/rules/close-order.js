module.exports = {
	name: 'close-order',

	init: function(context){
		context.addListener('tag:close', this, validate);
	},
};

function validate(event, report){
	/* handle unclosed tags */
	if ( typeof(event.target) === 'undefined' ){
		var previous = event.previous;
		report(previous, "Missing close-tag, expected '</" + previous.tagName + ">' but document ended before it was found.");
		return;
	}

	/* self-closing elements are always closed in correct order */
	if ( event.target.selfclose ){
		return;
	}

	var target = event.target;
	var previous = event.previous;
	if ( target.tagName !== previous.tagName ){
		report(target, "Mismatched close-tag, expected '</" + previous.tagName + ">' but found '</" + target.tagName + ">'.");
	}
}
