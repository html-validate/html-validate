import { type Attribute, type DynamicValue, type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
import { partition } from "./helper";

interface ControlDetails {
	/** `true` if control has name ending with `[]` */
	array: boolean;

	/** `true` if control is `type="hidden"` and hasn't been used as a default value yet */
	potentialHiddenDefault: boolean;
}

export interface RuleContext {
	name: string;
	kind: "duplicate" | "mix";
}

interface RuleOptions {
	allowArrayBrackets: boolean;
	allowCheckboxDefault: boolean;
	shared: Array<"radio" | "checkbox" | "submit" | "button" | "reset">;
}

const defaults: RuleOptions = {
	allowArrayBrackets: true,
	allowCheckboxDefault: true,
	shared: ["radio", "button", "reset", "submit"],
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
	return Boolean(type?.valueMatches(shared, false));
}

function isInputHidden(element: HtmlElement): boolean {
	return element.is("input") && element.getAttributeValue("type") === "hidden";
}

function isInputCheckbox(element: HtmlElement): boolean {
	return element.is("input") && element.getAttributeValue("type") === "checkbox";
}

function isCheckboxWithDefault(
	control: HtmlElement,
	previous: ControlDetails,
	options: RuleOptions,
): boolean {
	const { allowCheckboxDefault } = options;
	if (!allowCheckboxDefault) {
		return false;
	}
	if (!previous.potentialHiddenDefault) {
		return false;
	}
	if (!isInputCheckbox(control)) {
		return false;
	}
	return true;
}

function getDocumentation(context: RuleContext): string {
	const trailer = "Each form control must have a unique name.";
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

export default class FormDupName extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static schema(): SchemaObject {
		return {
			allowArrayBrackets: {
				type: "boolean",
			},
			allowCheckboxDefault: {
				type: "boolean",
			},
			shared: {
				type: "array",
				items: {
					enum: ["radio", "checkbox", "submit", "button", "reset"],
				},
			},
		};
	}

	public documentation(context: RuleContext): RuleDocumentation {
		return {
			description: getDocumentation(context),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const selector = this.getSelector();
		const { shared } = this.options;
		/* eslint-disable-next-line complexity -- technical debt */
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

				const group = control.closest("form, template") ?? document.root;
				this.validateUniqueName(control, group, attr, name);
			}

			/* validate all form controls which allows shared names to ensure there is
			 * no collision with other form controls */
			for (const control of sharedControls) {
				const attr = control.getAttribute("name");
				const name = attr?.value;
				if (!attr || !haveName(name)) {
					continue;
				}

				const group = control.closest("form, template") ?? document.root;
				this.validateSharedName(control, group, attr, name);
			}
		});
	}

	private validateUniqueName(
		control: HtmlElement,
		group: HtmlElement,
		attr: Attribute,
		name: string,
	): void {
		const elements = this.getUniqueElements(group);
		const { allowArrayBrackets } = this.options;

		if (allowArrayBrackets) {
			const isarray = name.endsWith("[]");
			const basename = isarray ? name.slice(0, -2) : name;
			const details = elements.get(basename);

			/* if a previous occurrence is found and one of the two is an array it is an error */
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
			}

			/* if this is an new array name store it for future tests */
			if (!details && isarray) {
				elements.set(basename, {
					array: true,
					potentialHiddenDefault: false,
				});
			}

			/* if this is an array and the previous test passed (no mixing array and
			 * non-array) no further testing needs to be done on this element. */
			if (isarray) {
				return;
			}
		}

		const previous = elements.get(name);
		if (previous) {
			if (isCheckboxWithDefault(control, previous, this.options)) {
				previous.potentialHiddenDefault = false;
				return;
			}
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
				potentialHiddenDefault: isInputHidden(control),
			});
		}
	}

	private validateSharedName(
		control: HtmlElement,
		group: HtmlElement,
		attr: Attribute,
		name: string,
	): void {
		const uniqueElements = this.getUniqueElements(group);
		const sharedElements = this.getSharedElements(group);
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
		/* istanbul ignore next: the earlier check for getTagsWithProperty ensures
		 * these will actually be set so this is just an untestable fallback */
		if (!meta?.formAssociated) {
			return false;
		}
		return meta.formAssociated.listed;
	}

	private getUniqueElements(group: HtmlElement): Map<string, ControlDetails> {
		const existing = group.cacheGet(UNIQUE_CACHE_KEY);
		if (existing) {
			return existing;
		} else {
			const elements = new Map<string, ControlDetails>();
			group.cacheSet(UNIQUE_CACHE_KEY, elements);
			return elements;
		}
	}

	private getSharedElements(group: HtmlElement): Map<string, string> {
		const existing = group.cacheGet(SHARED_CACHE_KEY);
		if (existing) {
			return existing;
		} else {
			const elements = new Map<string, string>();
			group.cacheSet(SHARED_CACHE_KEY, elements);
			return elements;
		}
	}
}
