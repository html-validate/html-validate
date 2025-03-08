/* eslint-disable @typescript-eslint/no-deprecated -- works for now and this will be removed when commonjs support ends */

/**
 * Similar to `require(..)` but removes the cached copy first.
 */
export function requireUncached(require: NodeJS.Require, moduleId: string): unknown {
	const filename = require.resolve(moduleId);

	/* remove references from the parent module to prevent memory leak */
	const m = require.cache[filename];
	if (m?.parent) {
		const { parent } = m;
		for (let i = parent.children.length - 1; i >= 0; i--) {
			if (parent.children[i].id === filename) {
				parent.children.splice(i, 1);
			}
		}
	}

	/* remove old module from cache */
	/* eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- needed to perform its function */
	delete require.cache[filename];

	/* eslint-disable-next-line import/no-dynamic-require, security/detect-non-literal-require -- as expected but should be moved to upcoming resolver class */
	return require(filename);
}
