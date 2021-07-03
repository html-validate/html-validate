import { legacyRequire } from "../resolve";

/**
 * Similar to `require(..)` but removes the cached copy first.
 */
export function requireUncached(moduleId: string): any {
	const filename = legacyRequire.resolve(moduleId);

	/* remove references from the parent module to prevent memory leak */
	const m = legacyRequire.cache[filename];
	if (m && m.parent) {
		const { parent } = m;
		for (let i = parent.children.length - 1; i >= 0; i--) {
			if (parent.children[i].id === filename) {
				parent.children.splice(i, 1);
			}
		}
	}

	/* remove old module from cache */
	delete legacyRequire.cache[filename];

	return legacyRequire(filename);
}
