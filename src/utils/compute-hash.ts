/**
 * Computes hash for given string.
 *
 * @internal
 */
function cyrb53(str: string): number {
	const a = 2654435761;
	const b = 1597334677;
	const c = 2246822507;
	const d = 3266489909;
	const e = 4294967296;
	const f = 2097151;
	const seed = 0;
	let h1 = 0xdeadbeef ^ seed;
	let h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, a);
		h2 = Math.imul(h2 ^ ch, b);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), c) ^ Math.imul(h2 ^ (h2 >>> 13), d);
	h2 = Math.imul(h2 ^ (h2 >>> 16), c) ^ Math.imul(h1 ^ (h1 >>> 13), d);
	return e * (f & h2) + (h1 >>> 0);
}

export const computeHash = cyrb53;
