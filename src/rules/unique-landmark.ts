import { type Location } from "../context";
import { type DOMTree, type HtmlElement, DynamicValue } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

function getTextFromReference(
	document: DOMTree,
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
		const selectors = [
			'aside, [role="complementary"]',
			'footer, [role="contentinfo"]',
			'form, [role="form"]',
			'header, [role="banner"]',
			'main, [role="main"]',
			'nav, [role="navigation"]',
			'section, [role="region"]',
			/* <search> does not (yet?) require a unique name */
		];
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			for (const selector of selectors) {
				const nodes = document.querySelectorAll(selector);

				/* if the landmark isn't present or at most a single occurrence it is
				 * considered unique */
				if (nodes.length <= 1) {
					continue;
				}

				const entries = nodes.map((it) => getTextEntryFromElement(document, it));
				for (const entry of entries) {
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
