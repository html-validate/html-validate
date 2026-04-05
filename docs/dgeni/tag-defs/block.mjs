function extractBlock(doc, tag, value) {
	const [, title, body] = value.match(/(.*?)\n([^]*)/m);
	const className = title.toLowerCase().replace(/[^\da-z]+/, "-");
	return {
		body,
		className,
		title,
	};
}

export default function blockTag() {
	return {
		name: "block",
		multi: true,
		docProperty: "blocks",
		transforms: extractBlock,
	};
}
