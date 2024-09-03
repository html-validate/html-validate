function extractBlock(doc, tag, value) {
	const [, title, body] = value.match(/(.*?)\n([^]*)/m);
	const className = title.toLowerCase().replace(/[^a-z0-9]+/, "-");
	return {
		body,
		className,
		title,
	};
}

module.exports = function blockTag() {
	return {
		name: "block",
		multi: true,
		docProperty: "blocks",
		transforms: extractBlock,
	};
};
