module.exports = {
	string: lintString,
};

var Context = require('./context');

var State = {
	TEXT: 0,
	TAG: 1,
};

var openTag = new RegExp('^<(/)?([a-zA-Z\-]+)([> ])');
var tagAttribute = /^([a-z]+)(?:=["']([a-z]+)["'])? */;

function lintString(str){
	parseHtml(str);
}

function parseHtml(str){
	var context = new Context(str);

	while ( context.string.length > 0 ){
		switch ( context.state ){
		case State.TEXT:
			parseInitial(context);
			break;

		case State.TAG:
			parseTag(context);
			break;
		}
	}

	return true;
}

function parseInitial(context){
	var match;

	if ( (match=context.match(openTag)) ){
		var close = match[1];
		var open = !close;
		var tag = match[2];
		var empty = match[3] === '>';

		if ( open ){
			context.push(tag);
		} else {
			var top = context.pop();
			if ( top !== tag ){
				console.error('wrong order, expected', top);
			}
		}

		if ( close && !empty ){
			console.error('close tag cannot have attr');
		}

		if ( empty ){
			context.consume(match, State.TEXT);
		} else {
			context.consume(match, State.TAG);
		}

		return;
	}

	throw Error('Failed to parse "' + context.string + "', expected tag");
}

function parseTag(context){
	var match;

	if ( context.string[0] === '>' ){
		context.consume(1, State.TEXT);
		return;
	}

	if ( (match=context.string.match(tagAttribute)) ){
		console.log('attr', match);
		context.consume(match);
		return;
	}

	throw Error('failed to parse "' + context.string + "', expected attribute or close-delimiter");
}
