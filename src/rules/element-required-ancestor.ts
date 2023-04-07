import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { naturalJoin } from "./helper";

export interface RuleContext {
	ancestor: string[];
	child: string;
}

function isTagnameOnly(value: string): boolean {
	return Boolean(value.match(/^[a-zA-Z0-9-]+$/));
}

function getRuleDescription(context?: RuleContext): string[] {
	if (!context) {
		return [
			"Some elements has restrictions on what content is allowed.",
			"This can include both direct children or descendant elements.",
		];
	}
	const escaped = context.ancestor.map((it) => `\`${it}\``);
	return [`The \`${context.child}\` element requires a ${naturalJoin(escaped)} ancestor.`];
}

export default class ElementRequiredAncestor extends Rule<RuleContext> {
	public documentation(context?: RuleContext): RuleDocumentation {
		return {
			description: getRuleDescription(context).join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				const parent = node.parent;

				/* istanbul ignore next: satisfy typescript but will visitDepthFirst()
				 * will not yield nodes without a parent */
				if (!parent) {
					return;
				}

				this.validateRequiredAncestors(node);
			});
		});
	}

	private validateRequiredAncestors(node: HtmlElement): void {
		if (!node.meta) {
			return;
		}

		const rules = node.meta.requiredAncestors;
		if (!rules) {
			return;
		}

		if (Validator.validateAncestors(node, rules)) {
			return;
		}

		const ancestor = rules.map((it) => (isTagnameOnly(it) ? `<${it}>` : `"${it}"`));
		const child = `<${node.tagName}>`;
		const message = `<${node.tagName}> element requires a ${naturalJoin(ancestor)} ancestor`;
		const context: RuleContext = {
			ancestor,
			child,
		};
		this.report(node, message, null, context);
	}
}
