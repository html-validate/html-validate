/**
 * Find a widget by __typename in a widgets array.
 *
 * @template T
 * @param {Array<{__typename: string}>} widgets
 * @param {string} typename
 * @returns {T | undefined}
 */
function findWidget(widgets, typename) {
	return /** @type {T | undefined} */ (widgets.find((w) => w.__typename === typename));
}

/**
 * Extract the first non-empty paragraph from a markdown description. The
 * excerpt ends at the first blank line.
 *
 * @param {string} description
 * @returns {string}
 */
export function extractExcerpt(description) {
	const paragraphs = description.split(/\n{2,}/);
	const first = paragraphs.find((p) => p.trim().length > 0);
	return first ? first.trim() : "";
}

/**
 * Sort children so open issues appear before closed ones.
 *
 * @param {Array<{state: string}>} children
 * @returns {Array<{state: string}>}
 */
export function sortChildren(children) {
	return children.toSorted((a, b) => {
		if (a.state === b.state) {
			return 0;
		}
		return a.state === "OPEN" ? -1 : 1;
	});
}

/**
 * Remove epics that carry the `docs::hidden` scoped label.
 *
 * @template {{labels: Array<{prefix: string | null, suffix: string | null}>}} T
 * @param {T[]} epics
 * @returns {T[]}
 */
export function filterHiddenEpics(epics) {
	return epics.filter(
		(epic) => !epic.labels.some((l) => l.prefix === "docs" && l.suffix === "hidden"),
	);
}

/**
 * Sort epics by weight ascending with nulls last, breaking ties by iid.
 *
 * @template {{weight: number | null, iid: string}} T
 * @param {T[]} epics
 * @returns {T[]}
 */
export function sortEpics(epics) {
	return epics.toSorted((a, b) => {
		if (a.weight === null && b.weight === null) {
			return Number(a.iid) - Number(b.iid);
		}
		if (a.weight === null) {
			return 1;
		}
		if (b.weight === null) {
			return -1;
		}
		if (a.weight !== b.weight) {
			return a.weight - b.weight;
		}
		return Number(a.iid) - Number(b.iid);
	});
}

/**
 * @param {Array<{__typename: string}>} widgets
 * @returns {number | null}
 */
function getWeight(widgets) {
	const w = /** @type {{weight: number | null} | undefined} */ (
		findWidget(widgets, "WorkItemWidgetWeight")
	);
	return w?.weight ?? null;
}

/**
 * @param {Array<{__typename: string}>} widgets
 * @returns {{color: string, textColor: string}}
 */
function getColorData(widgets) {
	const w = /** @type {{color: string, textColor: string} | undefined} */ (
		findWidget(widgets, "WorkItemWidgetColor")
	);
	return { color: w?.color ?? "#1068bf", textColor: w?.textColor ?? "#FFFFFF" };
}

/**
 * @param {Array<{__typename: string}>} widgets
 * @returns {Array<{title: string, prefix: string | null, suffix: string | null, color: string, textColor: string}>}
 */
function getLabels(widgets) {
	const w =
		/** @type {{labels: {nodes: Array<{title: string, color: string, textColor: string}>}} | undefined} */ (
			findWidget(widgets, "WorkItemWidgetLabels")
		);
	return (w?.labels?.nodes ?? []).map((l) => {
		const separatorIndex = l.title.indexOf("::");
		const isScoped = separatorIndex !== -1;
		return {
			title: l.title,
			prefix: isScoped ? l.title.slice(0, separatorIndex) : null,
			suffix: isScoped ? l.title.slice(separatorIndex + 2) : null,
			color: l.color,
			textColor: l.textColor,
		};
	});
}

/**
 * @param {Array<{__typename: string}>} widgets
 * @returns {string | null}
 */
function getDueDate(widgets) {
	const w = /** @type {{dueDate: string | null} | undefined} */ (
		findWidget(widgets, "WorkItemWidgetStartAndDueDate")
	);
	return w?.dueDate ?? null;
}

/**
 * @param {Array<{__typename: string}>} widgets
 * @returns {Array<{state: string}>}
 */
function getChildren(widgets) {
	const w = /** @type {{children: {nodes: Array<{state: string}>}} | undefined} */ (
		findWidget(widgets, "WorkItemWidgetHierarchy")
	);
	return sortChildren(w?.children?.nodes ?? []);
}

/**
 * Map a raw GitLab GraphQL work item node to a clean epic object.
 *
 * @param {object} node Raw GraphQL work item node.
 * @returns {object}
 */
export function transformEpic(node) {
	const widgets = /** @type {Array<{__typename: string}>} */ (node.widgets ?? []);
	const description = node.description ?? "";
	const { color, textColor } = getColorData(widgets);

	return {
		iid: node.iid,
		title: node.title,
		description,
		excerpt: extractExcerpt(description),
		color,
		textColor,
		labels: getLabels(widgets),
		dueDate: getDueDate(widgets),
		webUrl: node.webUrl,
		weight: getWeight(widgets),
		children: getChildren(widgets),
	};
}
