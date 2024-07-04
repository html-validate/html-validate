import fs from "fs";
import path from "node:path";
import ignore, { type Ignore } from "ignore";

export class IsIgnored {
	/** Cache for parsed .htmlvalidateignore files */
	private cacheIgnore: Map<string, Ignore | undefined>;

	public constructor() {
		this.cacheIgnore = new Map();
	}

	/**
	 * Searches ".htmlvalidateignore" files from filesystem and returns `true` if
	 * one of them contains a pattern matching given filename.
	 */
	public isIgnored(filename: string): boolean {
		return this.match(filename);
	}

	/**
	 * Clear cache
	 */
	public clearCache(): void {
		this.cacheIgnore.clear();
	}

	private match(target: string): boolean {
		let current = path.dirname(target);

		// eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition -- breaks out when filesystem is traversed
		while (true) {
			const relative = path.relative(current, target);
			const filename = path.join(current, ".htmlvalidateignore");

			/* test filename (relative to the ignore file) against the patterns */
			const ig = this.parseFile(filename);
			if (ig?.ignores(relative)) {
				return true;
			}

			/* get the parent directory */
			const child = current;
			current = path.dirname(current);

			/* stop if this is the root directory */
			if (current === child) {
				break;
			}
		}

		return false;
	}

	private parseFile(filename: string): Ignore | undefined {
		if (this.cacheIgnore.has(filename)) {
			return this.cacheIgnore.get(filename);
		}

		if (!fs.existsSync(filename)) {
			this.cacheIgnore.set(filename, undefined);
			return undefined;
		}

		const content = fs.readFileSync(filename, "utf-8");
		const ig = ignore().add(content);
		this.cacheIgnore.set(filename, ig);
		return ig;
	}
}
