import fs from "node:fs/promises";
import path from "canonical-path";

/**
 * @dgService writeFile
 * @description
 * Write the given contents to a file, ensuring the path to the file exists
 */
async function writeFileImpl(file, content) {
	await fs.mkdir(path.dirname(file), { recursive: true });
	await fs.writeFile(file, content);
}

export default function writeFile() {
	return writeFileImpl;
}
