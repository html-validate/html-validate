module.exports = {
	name: 'close-order',

	init: function(context){
		context.addListener('tag:close', this, validate);
	},
};

function validate(event, report){
	var target = event.target;
	var previous = event.previous;
	if ( target.tagName !== previous.tagName ){
		report(target, "Mismatched close-tag, expected '</" + previous.tagName + ">' but found '</" + target.tagName + ">'.");
	}
}
