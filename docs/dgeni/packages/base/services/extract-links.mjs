import { JSDOM } from "jsdom";

/**
 * @dgService extractLinks
 * @description
 * Extracts the links and references from a given html
 * @param {String} html The html
 */
function extractLinksImpl(html) {
	const result = { hrefs: [], names: [] };
	const dom = new JSDOM(html);
	try {
		const doc = dom.window.document;

		for (const el of doc.querySelectorAll("a[href]")) {
			result.hrefs.push(el.getAttribute("href"));
		}

		for (const el of doc.querySelectorAll("a[name]")) {
			result.names.push(el.getAttribute("name"));
		}

		for (const el of doc.querySelectorAll("[id]")) {
			result.names.push(el.getAttribute("id"));
		}
	} finally {
		dom.window.close();
	}

	return result;
}

export default function extractLinks() {
	return extractLinksImpl;
}
