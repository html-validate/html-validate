import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

const CACHE_KEY = Symbol("no-dup-id");

declare module "../dom/cache" {
	export interface DOMNodeCache {
		[CACHE_KEY]: Set<string>;
	}
}

export default class NoDupID extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: "The ID of an element must be unique.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const rootExisting = getExisting(document.root, document.root);
			const useRootExisting = !document.querySelector("template");
			const elements = document.querySelectorAll("[id]");
			for (const el of elements) {
				const attr = el.getAttribute("id");

				/* istanbul ignore next: can not really happen as querySelector will only return elements with id present */
				if (!attr) {
					continue;
				}

				/* id without value is not relevant, e.g. <p id></p> */
				if (!attr.value) {
					continue;
				}

				/* dynamic id (interpolated or otherwise currently unknown value) is not relevant */
				if (attr.isDynamic) {
					continue;
				}

				const id = attr.value.toString();

				const existing = useRootExisting ? rootExisting : getExisting(el, document.root);

				if (existing.has(id)) {
					this.report(el, `Duplicate ID "${id}"`, attr.valueLocation);
					continue;
				}

				existing.add(id);
			}
		});
	}
}

function getExisting(element: HtmlElement, root: HtmlElement): Set<string> {
	const group = element.closest("template") ?? root;
	const existing = group.cacheGet(CACHE_KEY);
	if (existing) {
		return existing;
	} else {
		const existing = new Set<string>();
		return group.cacheSet(CACHE_KEY, existing);
	}
}
