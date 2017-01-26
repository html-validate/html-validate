'use strict';

let State = {
	TEXT: 0,
	TAG: 1,
};

const openTag = new RegExp('^<(/)?([a-zA-Z0-9\-]+)(/)?([> ])');
const tagAttribute = /^([a-z\-]+)(?:=(["'])(.+?)(["']))? */;
const attributeEnd = new RegExp('^/?>');

class Parser {
	parseHtml(str, context, config, report){
		while ( context.string.length > 0 ){
			switch ( context.state ){
			case State.TEXT:
				this.parseInitial(context, config);
				break;

			case State.TAG:
				this.parseTag(context, config);
				break;
			}
		}

		/* trigger close events for any still open elements */
		var unclosed;
		while ( (unclosed=context.pop()) ){
			context.trigger('tag:close', {
				target: undefined,
				previous: unclosed,
			});
		}

		context.saveReport(report);
		return true;
	}

	parseInitial(context, config){
		var match;

		if ( (match=context.match(openTag)) ){
			var tag = match[2];
			var open = !match[1];
			var selfclose = !!match[3];
			var voidElement = config.html.voidElements.indexOf(tag.toLowerCase()) !== -1;
			var close = !open || selfclose || voidElement;
			var hasAttributes = match[4] !== '>';
			var node = {
				open: open,
				close: close,
				selfClosed: selfclose,
				voidElement: voidElement,
				tagName: tag,
				attr: {},
			};

			context.push(node);

			if ( open ){
				context.trigger('tag:open', {
					target: node,
				});
			}

			if ( !hasAttributes ){
				/* closed by attribute parsing */
				if ( close ){
					context.trigger('tag:close', {
						target: context.top(0),
						previous: context.top(1),
					});
					context.pop(); // pop itself
					if ( !(selfclose || voidElement) ){
						context.pop(); // pop closed element
					}
				}
			}

			if ( hasAttributes ){
				context.consume(match, State.TAG);
			} else {
				context.consume(match, State.TEXT);
			}

			return;
		}

		/* consume text node */
		const chars = context.string.indexOf('<');
		if ( chars > 0 ){ /* assume text up until next < */
			const text = context.string.slice(0, chars);
			context.trigger('text', {
				text,
			});
			context.consume(chars, State.TEXT);
			return;
		} else if ( context.string.length > 0 ){
			context.trigger('text', {
				text: context.string,
			});
			context.consume(context.string.length, State.TEXT);
			return;
		}

		const truncated = JSON.stringify(context.string.length > 13 ? (context.string.slice(0, 10) + '...') : context.string);
		const message = `${context.getContextData()}: failed to parse ${truncated}, expected tag.`;
		throw Error(message);
	}

	parseTag(context){
		var match;
		var node = context.top();

		if ( (match=context.string.match(attributeEnd)) ){
			if ( node.close || match[0] === '/>' ){
				context.trigger('tag:close', {
					target: context.top(0),
					previous: context.top(1),
				});
				context.pop(); // pop itself
				if ( !(node.selfClose || node.voidElement) ){
					context.pop(); // pop closed element
				}
			}
			context.consume(match, State.TEXT);
			return;
		}

		if ( (match=context.string.match(tagAttribute)) ){
			var key = match[1];
			var quote = match[2];
			var value = match[3];

			/* trigger before storing so it is possible to write a rule
			 * testing for duplicates. */
			context.trigger('attr', {
				target: node,
				key: key,
				value: value,
				quote: quote,
			});

			node.attr[key] = value;
			context.consume(match);
			return;
		}

		const truncated = JSON.stringify(context.string.length > 13 ? (context.string.slice(0, 10) + '...') : context.string);
		const message = `${context.getContextData()}: failed to parse ${truncated}, expected tag.`;
		throw Error(message);
	}
}

module.exports = Parser;
