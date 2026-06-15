function extractBlock(doc, tag, value) {
	const [, title, body] = value.match(/(.*)\n([\s\S]*)/);
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
