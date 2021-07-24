import path from "path";
import { Stats } from "fs";

interface Entry {
	type: "file" | "directory";
}

interface FileEntry extends Entry {
	type: "file";
	content: string;
}

interface DirectoryEntry extends Entry {
	type: "directory";
}

class FSError extends Error {
	public code: string;
	public path: string;

	public constructor(code: string, message: string, path: string) {
		super(message);
		this.code = code;
		this.path = path;
	}

	public toString(): string {
		return `${this.code}: ${this.message} '${this.path}'`;
	}
}

class ENOENT extends FSError {
	public constructor(filePath: string) {
		super("ENOENT", "no such file or directory", filePath);
	}
}

let mockData: Map<string, Entry> = new Map();

function isDirectory(entry: Entry): entry is DirectoryEntry {
	return entry.type === "directory";
}

function isFile(entry: Entry): entry is FileEntry {
	return entry.type === "file";
}

function normalize(filePath: string): string {
	return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
}

function mockFile(filePath: string, content: string): void {
	const normalized = normalize(filePath);
	const fileEntry: FileEntry = {
		type: "file",
		content,
	};
	mockData.set(normalized, fileEntry);
	let current = path.dirname(normalized);
	while (current !== "/") {
		if (mockData.has(current)) {
			break;
		}
		const dirEntry: DirectoryEntry = {
			type: "directory",
		};
		mockData.set(current, dirEntry);
		current = path.dirname(current);
	}
}

function mockReset(): void {
	mockData = new Map();
	const rootEntry: DirectoryEntry = {
		type: "directory",
	};
	mockData.set("/", rootEntry);
}

function existsSync(filePath: string): boolean {
	return mockData.has(normalize(filePath));
}

function readdirSync(
	filePath: string,
	options?: string | { encoding?: string; withFileTypes?: boolean }
): string[] | Buffer[] {
	if (!filePath) {
		throw new ENOENT(filePath);
	}
	const normalized = normalize(filePath);
	const entry = mockData.get(normalized);
	if (!entry) {
		throw new ENOENT(filePath);
	}
	if (!isDirectory(entry)) {
		throw new FSError("ENOTDIR", "not a directory", filePath);
	}
	const encoding = typeof options === "string" ? options : options?.encoding ?? "utf-8";
	const entries = Array.from(mockData.keys())
		.filter((it) => path.dirname(it) === normalized)
		.map((it) => path.basename(it))
		.sort();
	if (typeof options !== "string" && options?.withFileTypes) {
		throw new Error("NotImplemented: readdirSync option withFileTypes is not supported by mock");
	}
	if (encoding !== "utf-8") {
		throw new Error("NotImplemented: readdirSync encoding only supports utf-8");
	}
	return entries;
}

function readFileSync(
	filePath: string,
	options?: string | { encoding?: string; flag?: string }
): Buffer | string {
	if (!filePath) {
		throw new ENOENT(filePath);
	}
	const normalized = normalize(filePath);
	const entry = mockData.get(normalized);
	if (!entry) {
		throw new ENOENT(filePath);
	}
	if (!isFile(entry)) {
		throw new FSError("EISDIR", "illegal operation on a directory", filePath);
	}
	if (typeof options === "string" || options?.encoding) {
		return entry.content;
	} else {
		return Buffer.from(entry.content, "utf-8");
	}
}

function statSync(filePath: string): Stats {
	if (!filePath) {
		throw new ENOENT(filePath);
	}
	const normalized = normalize(filePath);
	const date = new Date();
	const time = date.getTime();
	const entry = mockData.get(normalized);
	if (!entry) {
		throw new ENOENT(filePath);
	}
	return {
		isFile: () => isFile(entry),
		isDirectory: () => isDirectory(entry),
		isBlockDevice: () => false,
		isCharacterDevice: () => false,
		isSymbolicLink: () => false,
		isFIFO: () => false,
		isSocket: () => false,
		dev: 1,
		ino: 1,
		mode: 0b110110110,
		nlink: 1,
		uid: 1,
		gid: 1,
		rdev: 1,
		size: 1,
		blksize: 1,
		blocks: 1,
		atimeMs: time,
		mtimeMs: time,
		ctimeMs: time,
		birthtimeMs: time,
		atime: date,
		mtime: date,
		ctime: date,
		birthtime: date,
	};
}

const original = jest.requireActual("fs");
const fs = {
	__esModule: undefined,

	mockFile,
	mockReset,

	existsSync,
	realpath: original.realpath,
	realpathSync: original.realpathSync,
	readdirSync,
	readFileSync,
	statSync,
	lstatSync: statSync,
};

module.exports = new Proxy(fs, {
	get(target, prop, receiver) {
		if (Reflect.has(target, prop)) {
			return Reflect.get(target, prop, receiver);
		} else {
			throw new Error(`fs mock does not implement "${prop.toString()}"`);
		}
	},
});
