import minimatch from "minimatch";

const glob: any = jest.requireActual("glob");

interface Options {
	cwd?: string;
}

let mockFiles: string[] = null;

function setMockFiles(files: string[]): void {
	mockFiles = files;
}

function resetMock(): void {
	mockFiles = null;
}

const originalSync = glob.sync;
function syncMock(pattern: string, options: Options = {}): string[] {
	if (!mockFiles) {
		return originalSync(pattern, options);
	}

	/* slice the cwd away since it is prepended automatically and makes it harder
	 * to test with */
	const cwd = options.cwd || "";
	const dir = cwd.replace(process.cwd(), "").replace(/^\/(.*)/, "$1/");

	let src = mockFiles;
	if (dir) {
		src = src
			.filter(cur => cur.startsWith(dir))
			.map(cur => cur.slice(dir.length));
	}

	return src.filter(cur => minimatch(cur, pattern));
}

glob.setMockFiles = setMockFiles;
glob.resetMock = resetMock;
glob.sync = syncMock;

module.exports = glob;
