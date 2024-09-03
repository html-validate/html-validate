/**
 * @dgRenderFilter marked
 * @description Convert the value, as markdown, into HTML using the marked library
 */
module.exports = function markedNunjucksFilter(renderMarkdown) {
	return {
		name: "marked",
		process(str) {
			return str && renderMarkdown(str);
		},
	};
};
