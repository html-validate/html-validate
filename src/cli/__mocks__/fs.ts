import path from "path";

let mockDirectory: string[] = [];

function setMockDirectories(directories: string[]): void {
	mockDirectory = directories;
}

function statSync(dir: string): any {
	/* slice the cwd away since it is prepended automatically and makes it harder
	 * to test with */
	const suffix = dir.replace(`${process.cwd()}${path.sep}`, "");

	const found = mockDirectory.indexOf(suffix) >= 0;
	return {
		isDirectory() {
			return found;
		},
	};
}

module.exports = {
	setMockDirectories,
	statSync,
	readFileSync: () => {
		throw new Error("ENOENT");
	},
};
