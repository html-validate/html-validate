import { type Location } from "../context";
import { type DOMTree, type HtmlElement, DynamicValue } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

const roles = ["complementary", "contentinfo", "form", "banner", "main", "navigation", "region"];

const selectors = [
	"aside",
	"footer",
	"form",
	"header",
	"main",
	"nav",
	"section",
	...roles.map((it) => `[role="${it}"]`),
	/* <search> does not (yet?) require a unique name */
];

function getTextFromReference(
	document: DOMTree,
	/* eslint-disable-next-line sonarjs/use-type-alias -- technical debt */
	id: string | DynamicValue | null,
): string | DynamicValue | null {
	if (!id || id instanceof DynamicValue) {
		return id;
	}

	const selector = `#${id}`;
	const ref = document.querySelector(selector);
	if (ref) {
		return ref.textContent;
	} else {
		/* If the referenced element cannot be found (maybe outside the fragment
		 * being tested) we use the selector as text, i.e. if two landmarks
		 * reference the same selector they would still be flagged as
		 * non-unique. */
		return selector;
	}
}

/* until Array.groupBy(..) can be used (Node 21) */
function groupBy<T, K extends string | number | symbol>(
	values: T[],
	callback: (value: T) => K,
): Record<K, T[]> {
	const result = {} as Record<K, T[]>;
	for (const value of values) {
		const key = callback(value);
		if (key in result) {
			result[key].push(value);
		} else {
			result[key] = [value];
		}
	}
	return result;
}

function getTextEntryFromElement(
	document: DOMTree,
	node: HtmlElement,
): {
	node: HtmlElement;
	text: string | DynamicValue | null;
	location: Location;
} {
	const ariaLabel = node.getAttribute("aria-label");
	if (ariaLabel) {
		return {
			node,
			text: ariaLabel.value,
			location: ariaLabel.keyLocation,
		};
	}

	const ariaLabelledby = node.getAttribute("aria-labelledby");
	if (ariaLabelledby) {
		const text = getTextFromReference(document, ariaLabelledby.value);
		return {
			node,
			text,
			location: ariaLabelledby.keyLocation,
		};
	}

	return {
		node,
		text: null,
		location: node.location,
	};
}

function isExcluded(entry: { node: HtmlElement; text: string | DynamicValue | null }): boolean {
	const { node, text } = entry;
	if (text === null) {
		return !(node.is("form") || node.is("section"));
	}
	return true;
}

export default class UniqueLandmark extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: [
				"When the same type of landmark is present more than once in the same document each must be uniquely identifiable with a non-empty and unique name.",
				"For instance, if the document has two `<nav>` elements each of them need an accessible name to be distinguished from each other.",
				"",
				"The following elements / roles are considered landmarks:",
				"",
				'  - `aside` or `[role="complementary"]`',
				'  - `footer` or `[role="contentinfo"]`',
				'  - `form` or `[role="form"]`',
				'  - `header` or `[role="banner"]`',
				'  - `main` or `[role="main"]`',
				'  - `nav` or `[role="navigation"]`',
				'  - `section` or `[role="region"]`',
				"",
				"To fix this either:",
				"",
				"  - Add `aria-label`.",
				"  - Add `aria-labelledby`.",
				"  - Remove one of the landmarks.",
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const elements = document
				.querySelectorAll(selectors.join(","))
				.filter((it) => typeof it.role === "string" && roles.includes(it.role));
			const grouped = groupBy(elements, (it) => it.role as string);
			for (const nodes of Object.values(grouped)) {
				/* if the landmark isn't present or at most a single occurrence it is
				 * considered unique */
				if (nodes.length <= 1) {
					continue;
				}

				const entries = nodes.map((it) => getTextEntryFromElement(document, it));

				/* edge case: unnamed forms are not considered landmarks */
				const filteredEntries = entries.filter(isExcluded);

				for (const entry of filteredEntries) {
					if (entry.text instanceof DynamicValue) {
						continue;
					}
					const dup = entries.filter((it) => it.text === entry.text).length > 1;
					if (!entry.text || dup) {
						const message = `Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby)`;
						const location = entry.location;
						this.report({
							node: entry.node,
							message,
							location,
						});
					}
				}
			}
		});
	}
}
