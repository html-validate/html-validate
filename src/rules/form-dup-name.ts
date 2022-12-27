import { type Attribute, type DynamicValue, type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

const CACHE_KEY = Symbol("form-elements");

declare module "../dom/cache" {
	export interface DOMNodeCache {
		[CACHE_KEY]: Set<string>;
	}
}

export interface RuleContext {
	name: string;
}

function haveName(name: string | DynamicValue | null | undefined): name is string {
	return typeof name === "string" && name !== "";
}

function isRelevant(node: HtmlElement): boolean {
	if (node.is("input")) {
		/* ignore radiobuttons and checkboxes */
		const type = node.getAttribute("type");
		return !type || !type.valueMatches(["radio", "checkbox"], true);
	}
	return true;
}

export default class FormDupName extends Rule<RuleContext> {
	public documentation(): RuleDocumentation {
		return {
			description: "Each form control must have a unique name.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const selector = this.getSelector();
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const controls = document.querySelectorAll(selector).filter(isRelevant);
			for (const control of controls) {
				const attr = control.getAttribute("name");
				const name = attr?.value;
				if (attr && haveName(name)) {
					const form = control.closest("form") ?? document.root;
					this.validateName(control, form, attr, name);
				}
			}
		});
	}

	private validateName(
		control: HtmlElement,
		form: HtmlElement,
		attr: Attribute,
		name: string
	): void {
		const elements = this.getElements(form);
		if (elements.has(name)) {
			const context: RuleContext = {
				name,
			};
			this.report({
				node: control,
				location: attr.valueLocation,
				message: 'Duplicate form control name "{{ name }}"',
				context,
			});
		} else {
			elements.add(name);
		}
	}

	private getSelector(): string {
		const tags = this.getTagsWithProperty("formAssociated").filter((it) => {
			return this.isListedElement(it);
		});
		return tags.join(", ");
	}

	private isListedElement(tagName: string): boolean {
		const meta = this.getMetaFor(tagName);
		/* istanbul ignore if: the earlier check for getTagsWithProperty ensures
		 * these will actually be set so this is just an untestable fallback */
		if (!meta || !meta.formAssociated) {
			return false;
		}
		return meta.formAssociated.listed;
	}

	private getElements(form: HtmlElement): Set<string> {
		const existing = form.cacheGet(CACHE_KEY);
		if (existing) {
			return existing;
		} else {
			const elements = new Set<string>();
			form.cacheSet(CACHE_KEY, elements);
			return elements;
		}
	}
}
