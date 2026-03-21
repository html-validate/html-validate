const fs = require("node:fs/promises");
const path = require("canonical-path");
/**
 * @dgService writeFile
 * @description
 * Write the given contents to a file, ensuring the path to the file exists
 */
module.exports = function writeFile() {
	return async (file, content) => {
		await fs.mkdir(path.dirname(file), { recursive: true });
		await fs.writeFile(file, content);
	};
};
