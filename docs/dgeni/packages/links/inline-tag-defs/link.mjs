/* eslint-disable unicorn/comment-content -- false positive */

const INLINE_LINK = /(\S+)(?:\s+([\s\S]+))?/;

/**
 * @dgService linkInlineTagDef
 * @description
 * Process inline link tags (of the form {@link some/uri Some Title}), replacing them with HTML anchors
 * @kind function
 * @param  {Object} url   The URL to match
 * @param  {Function} docs error message
 * @return {String}  The HTML link information
 *
 * @property {boolean} relativeLinks Whether we expect the links to be relative to the originating doc
 */
export default function linkInlineTagDef(getLinkInfo, createDocMessage, log) {
	return {
		name: "link",
		description:
			"Process inline link tags (of the form {@link some/uri Some Title}), replacing them with HTML anchors",
		handler(doc, tagName, tagDescription) {
			// Parse out the URI and title
			return tagDescription.replace(INLINE_LINK, (match, uri, title) => {
				const linkInfo = getLinkInfo(uri, title, doc);

				if (!linkInfo.valid) {
					log.warn(createDocMessage(linkInfo.error, doc));
				}

				return `<a href="${linkInfo.url}">${linkInfo.title}</a>`;
			});
		},
	};
}
