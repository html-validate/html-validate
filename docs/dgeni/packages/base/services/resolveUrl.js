const url = require("url");
const path = require("canonical-path");

/**
 * @dgService resolveUrl
 * @description
 * Calculates the absolute path of the url from the current path,
 * the relative path and the base
 * @param {String=} currentPath The current path
 * @param {String} newPath The new path
 * @param {String=} base The base path
 */
module.exports = function resolveUrl() {
	return (currentPath, newPath, base) => {
		// Extract only the path and the hash from the newPath
		/* eslint-disable-next-line n/no-deprecated-api -- technical debt */
		const parsedUrl = url.parse(newPath);
		parsedUrl.search = null;
		newPath = url.format(parsedUrl);

		if (base && newPath.charAt(0) !== "/") {
			// Resolve against the base url if there is a base and the new path is not absolute
			newPath = path.resolve(base, newPath).replace(/^(\w:)?\//, "");
		} else {
			// Otherwise resolve against the current path
			/* eslint-disable-next-line n/no-deprecated-api -- technical debt */
			newPath = url.resolve(currentPath || "", newPath);
		}

		return newPath;
	};
};
