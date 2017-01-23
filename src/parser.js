'use strict';

let State = {
	TEXT: 0,
	TAG: 1,
};

const openTag = new RegExp('^<(/)?([a-zA-Z\-]+)(/)?([> ])');
const tagAttribute = /^([a-z]+)(?:=["']([a-z]+)["'])? */;

class Parser {
	parseHtml(str, context, report){
		while ( context.string.length > 0 ){
			switch ( context.state ){
			case State.TEXT:
				this.parseInitial(context);
				break;

			case State.TAG:
				this.parseTag(context);
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

	parseInitial(context){
		var match;

		if ( (match=context.match(openTag)) ){
			var open = !match[1];
			var close = !!(match[1] || match[3]);
			var selfclose = !!match[3];
			var tag = match[2];
			var hasAttributes = match[4] !== '>';
			var node = {
				open: open,
				close: close,
				selfclose: selfclose,
				tagName: tag,
				attr: {},
			};

			context.push(node);

			if ( !hasAttributes ){
				if ( open ){
					context.trigger('tag:open', {
						target: node,
					});
				}

				if ( close ){
					context.trigger('tag:close', {
						target: context.top(0),
						previous: context.top(1),
					});
					context.pop(); // pop itself
					if ( !selfclose ){
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

		throw Error('Failed to parse "' + context.string + "', expected tag");
	}

	parseTag(context){
		var match;
		var node = context.top();

		if ( context.string[0] === '>' ){
			if ( !node.close ){
				context.trigger('tag:open', {
					target: node,
				});
			} else {
				context.trigger('tag:close', {
					target: context.top(0),
					previous: context.top(1),
				});
				context.pop(); // pop itself
				context.pop(); // pop closed element
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
				target: node,
				key: key,
				value: value,
			});

			node.attr[key] = value;
			context.consume(match);
			return;
		}

		throw Error('failed to parse "' + context.string + "', expected attribute or close-delimiter");
	}
}

module.exports = Parser;
