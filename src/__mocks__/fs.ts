import { fs as memfs } from "memfs";

const fs = {
	__esModule: true,
	existsSync: memfs.existsSync.bind(memfs),
	lstatSync: memfs.lstatSync.bind(memfs),
	mkdirSync: memfs.mkdirSync.bind(memfs),
	readFileSync: memfs.readFileSync.bind(memfs),
	readdir: memfs.readdir.bind(memfs),
	readdirSync: memfs.readdirSync.bind(memfs),
	readlinkSync: memfs.readlinkSync.bind(memfs),
	realpath: memfs.realpath.bind(memfs),
	realpathSync: { native: memfs.realpathSync.bind(memfs) },
	statSync: memfs.statSync.bind(memfs),
	writeFile: memfs.writeFile.bind(memfs),
	writeFileSync: memfs.writeFileSync.bind(memfs),
};

const proxy = new Proxy(fs, {
	get(target, prop, receiver): any {
		if (prop === "default") {
			return proxy;
		}
		if (Reflect.has(target, prop)) {
			return Reflect.get(target, prop, receiver);
		} else {
			throw new Error(`fs mock does not implement "${prop.toString()}"`);
		}
	},
});

module.exports = proxy;
