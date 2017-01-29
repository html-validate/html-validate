module.exports = {
	name: 'attr-quotes',

	defaults: {
		style: 'double',
	},

	init: function(context, options){
		context.addListener('attr', validate);
		this.options = Object.assign(this.defaults, options);
		this.expected = parseStyle(this.options.style);
	},
};

function parseStyle(style){
	switch ( style.toLowerCase() ){
	case 'double': return '"';
	case 'single': return "'";
	default: return '"';
	}
}

function validate(event, report){
	/* ignore attributes with not value */
	if ( typeof(event.value) === 'undefined' ){
		return;
	}

	if ( event.quote !== this.expected ){
		report(event.target, "Attribute '" + event.key + "' used ' + event.quote + ' instead of expected " + this.expected);
	}
}
