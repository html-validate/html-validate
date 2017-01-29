module.exports = {
	name: 'close-attr',

	init: function(context){
		context.addListener('tag:close', validate);
	},
};

function validate(event, report){
	/* handle unclosed tags */
	if ( typeof(event.target) === 'undefined' ){
		return;
	}

	/* ignore self-closed and void */
	if ( event.target.selfClosed || event.target.voidElement ){
		return;
	}

	if ( Object.keys(event.target.attr).length > 0 ){
		report(event.target, "Close tags cannot have attributes");
	}
}
