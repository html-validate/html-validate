'use strict';

module.exports = {
	string: lintString,
	addListener,
};

var Context = require('./context');
var globalListeners = {};

var State = {
	TEXT: 0,
	TAG: 1,
};

var openTag = new RegExp('^<(/)?([a-zA-Z\-]+)([> ])');
var tagAttribute = /^([a-z]+)(?:=["']([a-z]+)["'])? */;

/**
 * Add a global event listener.
 *
 * @param event [string] - Event name or '*' for any event
 * @param callback [function] - Called any time even triggers
 */
function addListener(event, callback){
	globalListeners[event] = globalListeners[event] || [];
	globalListeners[event].push(callback);
}

function lintString(str, report){
	return parseHtml(str, report);
}

function parseHtml(str, report){
	var context = new Context(str, globalListeners);
	context.addRule(require('./rules/close-attr'));
	context.addRule(require('./rules/close-order'));

	// context.addListener('attr', function(data){
	// 	console.log('attr', data.tagName);
	// });

	// context.addListener('tag:open', function(data){
	// 	console.log('tag open', data.tagName, data.close);
	// });

	// context.addListener('tag:close', function(data){
	// 	var current = data.current;
	// 	var previous = data.previous;
	// 	console.log('tag close', current.tagName, current.attr);
	// });

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

	context.saveReport(report);
	return true;
}

function parseInitial(context){
	var match;

	if ( (match=context.match(openTag)) ){
		var close = !!match[1];
		var open = !close;
		var tag = match[2];
		var empty = match[3] === '>';
		var node = {
			close: close,
			tagName: tag,
			attr: {},
		};

		context.push(node);

		if ( empty ){
			if ( open ){
				context.trigger('tag:open', node);
			}

			if ( close ){
				context.trigger('tag:close', {
					current: context.top(0),
					previous: context.top(1),
				});
				context.pop();
			}
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
	var node = context.top();

	if ( context.string[0] === '>' ){
		if ( !node.close ){
			context.trigger('tag:open', node);
		} else {
			context.trigger('tag:close', {
				current: context.top(0),
				previous: context.top(1),
			});
			context.pop();
		}
		context.consume(1, State.TEXT);
		return;
	}

	if ( (match=context.string.match(tagAttribute)) ){
		var key = match[1];
		var value = match[2];

		/* trigger before storing so it is possible to write a rule
		 * testing for duplicates. */
		context.trigger('attr', {
			node: node,
			key: key,
			value: value,
		});

		node.attr[key] = value;
		context.consume(match);
		return;
	}

	throw Error('failed to parse "' + context.string + "', expected attribute or close-delimiter");
}
