/**
 * @public
 */
export interface IncludeExcludeOptions {
	include: string[] | null;
	exclude: string[] | null;
}

const patternCache = new Map<string, RegExp>();

function compileStringPattern(pattern: string): RegExp {
	const regexp = pattern.replace(/[*]+/g, ".+");
	/* eslint-disable-next-line security/detect-non-literal-regexp -- technical debt, should do input sanitation and precompilation */
	return new RegExp(`^${regexp}$`);
}

function compileRegExpPattern(pattern: string): RegExp {
	/* eslint-disable-next-line security/detect-non-literal-regexp -- technical debt, should do input sanitation and precompilation */
	return new RegExp(`^${pattern}$`);
}

function compilePattern(pattern: string): RegExp {
	const cached = patternCache.get(pattern);
	if (cached) {
		return cached;
	}
	const match = /^\/(.*)\/$/.exec(pattern);
	const regexp = match ? compileRegExpPattern(match[1]) : compileStringPattern(pattern);
	patternCache.set(pattern, regexp);
	return regexp;
}

/**
 * @internal
 */
export function keywordPatternMatcher(list: string[], keyword: string): boolean {
	for (const pattern of list) {
		const regexp = compilePattern(pattern);
		if (regexp.test(keyword)) {
			return true;
		}
	}
	return false;
}

/**
 * @internal
 */
export function isKeywordIgnored(
	options: IncludeExcludeOptions,
	keyword: string,
	matcher: (list: string[], it: string) => boolean = (list, it) => list.includes(it),
): boolean {
	const { include, exclude } = options;

	/* ignore keyword if not present in "include" */
	if (include && !matcher(include, keyword)) {
		return true;
	}

	/* ignore keyword if present in "excludes" */
	if (exclude && matcher(exclude, keyword)) {
		return true;
	}

	return false;
}
