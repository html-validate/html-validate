import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type CategoryOrTag, Validator } from "../meta";
import { type Permitted, type PermittedEntry } from "../meta/element";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { naturalJoin } from "../utils/natural-join";
import { walk } from "../utils/walk";

export interface RuleContext {
	parent: string;
	child: string;
	rules: Permitted;
}

function isCategoryOrTag(value: PermittedEntry): value is CategoryOrTag {
	return typeof value === "string";
}

function isCategory(value: CategoryOrTag): boolean {
	return value.startsWith("@");
}

function formatCategoryOrTag(value: CategoryOrTag): string {
	return isCategory(value) ? value.slice(1) : `<${value}>`;
}

function isFormattable(rules: Permitted): rules is CategoryOrTag[] {
	return rules.length > 0 && rules.every(isCategoryOrTag);
}

function getRuleDescription(context: RuleContext): string[] {
	const { child, parent, rules } = context;
	const preamble = `The \`${child}\` element cannot have a \`${parent}\` element as parent.`;
	if (isFormattable(rules)) {
		const allowed = rules.filter(isCategoryOrTag).map((it) => {
			if (isCategory(it)) {
				return `- any ${it.slice(1)} element`;
			} else {
				return `- \`<${it}>\``;
			}
		});
		return [preamble, "", "Allowed parents one of:", "", ...allowed];
	} else {
		return [preamble];
	}
}

function formatMessage(node: HtmlElement, parent: HtmlElement, rules: Permitted): string {
	const nodeName = node.annotatedName;
	const parentName = parent.annotatedName;
	if (!isFormattable(rules)) {
		return `${nodeName} element cannot have ${parentName} element as parent`;
	}
	const allowed = naturalJoin(rules.filter(isCategoryOrTag).map(formatCategoryOrTag));
	return `${nodeName} element requires a ${allowed} element as parent`;
}

export default class ElementPermittedParent extends Rule<RuleContext> {
	public documentation(context: RuleContext): RuleDocumentation {
		return {
			description: getRuleDescription(context).join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			walk.depthFirst(doc, (node: HtmlElement) => {
				const parent = node.parent;

				/* istanbul ignore next: satisfy typescript but will visitDepthFirst()
				 * will not yield nodes without a parent */
				if (!parent) {
					return;
				}

				/* don't validate root element as the <html> and <body> tag is optional
				 * so anything could be directly under the root element. */
				if (parent.isRootElement()) {
					return;
				}

				/* when the parent element is the same as the current element we ignore
				 * this rule and let `element-permitted-content` handle it as it will
				 * create a lot of duplicate errors otherwise */
				if (parent.tagName === node.tagName) {
					return;
				}

				/* if parent doesn't have metadata (unknown element) skip checking permitted
				 * content */
				const rules = node.meta?.permittedParent;
				if (!rules) {
					return false;
				}

				if (Validator.validatePermitted(parent, rules)) {
					return;
				}

				const message = formatMessage(node, parent, rules);
				const context: RuleContext = {
					parent: parent.annotatedName,
					child: node.annotatedName,
					rules,
				};
				this.report(node, message, null, context);
			});
		});
	}
}
