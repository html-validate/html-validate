import { type Attribute, type DynamicValue, type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
import { partition } from "./helper";

interface ControlDetails {
	array: boolean;
}

export interface RuleContext {
	name: string;
	kind: "duplicate" | "mix";
}

interface RuleOptions {
	allowArrayBrackets: boolean;
	shared: Array<"radio" | "checkbox" | "submit">;
}

const defaults: RuleOptions = {
	allowArrayBrackets: true,
	shared: ["radio"],
};

const UNIQUE_CACHE_KEY = Symbol("form-elements-unique");
const SHARED_CACHE_KEY = Symbol("form-elements-shared");

declare module "../dom/cache" {
	export interface DOMNodeCache {
		[UNIQUE_CACHE_KEY]: Map<string, ControlDetails>;
		[SHARED_CACHE_KEY]: Map<string, string>;
	}
}

function haveName(name: string | DynamicValue | null | undefined): name is string {
	return typeof name === "string" && name !== "";
}

function allowSharedName(node: HtmlElement, shared: string[]): boolean {
	const type = node.getAttribute("type");
	return Boolean(type && type.valueMatches(shared, false));
}

function getDocumentation(context?: RuleContext): string {
	const trailer = "Each form control must have a unique name.";
	if (!context) {
		return trailer;
	} else {
		const { name } = context;
		switch (context.kind) {
			case "duplicate":
				return [`Duplicate form control name "${name}"`, trailer].join("\n");
			case "mix":
				return [
					`Form control name cannot mix regular name "{{ name }}" with array brackets "{{ name }}[]"`,
					trailer,
				].join("\n");
		}
	}
}

export default class FormDupName extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static schema(): SchemaObject {
		return {
			allowArrayBrackets: {
				type: "boolean",
			},
			shared: {
				type: "array",
				items: {
					enum: ["radio", "checkbox", "submit"],
				},
			},
		};
	}

	public documentation(context?: RuleContext): RuleDocumentation {
		return {
			description: getDocumentation(context),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const selector = this.getSelector();
		const { shared } = this.options;
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const controls = document.querySelectorAll(selector);
			const [sharedControls, uniqueControls] = partition(controls, (it) => {
				return allowSharedName(it, shared);
			});

			/* validate all form controls which require unique elements first so each
			 * form has a populated list of unique names */
			for (const control of uniqueControls) {
				const attr = control.getAttribute("name");
				const name = attr?.value;
				if (!attr || !haveName(name)) {
					continue;
				}

				const form = control.closest("form") ?? document.root;
				this.validateUniqueName(control, form, attr, name);
			}

			/* validate all form controls which allows shared names to ensure there is
			 * no collision with other form controls */
			for (const control of sharedControls) {
				const attr = control.getAttribute("name");
				const name = attr?.value;
				if (!attr || !haveName(name)) {
					continue;
				}

				const form = control.closest("form") ?? document.root;
				this.validateSharedName(control, form, attr, name);
			}
		});
	}

	private validateUniqueName(
		control: HtmlElement,
		form: HtmlElement,
		attr: Attribute,
		name: string
	): void {
		const elements = this.getUniqueElements(form);
		const { allowArrayBrackets } = this.options;

		if (allowArrayBrackets) {
			const isarray = name.endsWith("[]");
			const basename = isarray ? name.slice(0, -2) : name;
			const details = elements.get(basename);
			if (details && details.array !== isarray) {
				const context: RuleContext = {
					name: basename,
					kind: "mix",
				};
				this.report({
					node: control,
					location: attr.valueLocation,
					message: 'Cannot mix "{{ name }}[]" and "{{ name }}"',
					context,
				});
				return;
			} else if (!details && isarray) {
				elements.set(basename, {
					array: true,
				});
				return;
			}
		}

		if (elements.has(name)) {
			const context: RuleContext = {
				name,
				kind: "duplicate",
			};
			this.report({
				node: control,
				location: attr.valueLocation,
				message: 'Duplicate form control name "{{ name }}"',
				context,
			});
		} else {
			elements.set(name, {
				array: false,
			});
		}
	}

	private validateSharedName(
		control: HtmlElement,
		form: HtmlElement,
		attr: Attribute,
		name: string
	): void {
		const uniqueElements = this.getUniqueElements(form);
		const sharedElements = this.getSharedElements(form);
		/* istanbul ignore next: type will always be set or shared name wouldn't be allowed */
		const type = control.getAttributeValue("type") ?? "";
		if (
			uniqueElements.has(name) ||
			(sharedElements.has(name) && sharedElements.get(name) !== type)
		) {
			const context: RuleContext = {
				name,
				kind: "duplicate",
			};
			this.report({
				node: control,
				location: attr.valueLocation,
				message: 'Duplicate form control name "{{ name }}"',
				context,
			});
		}
		sharedElements.set(name, type);
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

	private getUniqueElements(form: HtmlElement): Map<string, ControlDetails> {
		const existing = form.cacheGet(UNIQUE_CACHE_KEY);
		if (existing) {
			return existing;
		} else {
			const elements = new Map<string, ControlDetails>();
			form.cacheSet(UNIQUE_CACHE_KEY, elements);
			return elements;
		}
	}

	private getSharedElements(form: HtmlElement): Map<string, string> {
		const existing = form.cacheGet(SHARED_CACHE_KEY);
		if (existing) {
			return existing;
		} else {
			const elements = new Map<string, string>();
			form.cacheSet(SHARED_CACHE_KEY, elements);
			return elements;
		}
	}
}
