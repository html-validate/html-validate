import { type DOMTree, type HtmlElement } from "../../dom";
import { type DOMReadyEvent } from "../../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../../rule";

export default class H32 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "WCAG 2.1 requires each `<form>` element to have at least one submit button.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		/* query all tags with form property, normally this is only the <form> tag
		 * but with custom element metadata other tags might be considered form
		 * (usually a component wrapping a <form> element) */
		const formTags = this.getTagsWithProperty("form");
		const formSelector = formTags.join(",");

		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const forms = document.querySelectorAll(formSelector);

			for (const form of forms) {
				/* find nested submit buttons */
				if (hasNestedSubmit(form)) {
					continue;
				}

				/* find explicitly associated submit buttons */
				if (hasAssociatedSubmit(document, form)) {
					continue;
				}

				this.report(form, `<${form.tagName}> element must have a submit button`);
			}
		});
	}
}

function isSubmit(node: HtmlElement): boolean {
	const type = node.getAttribute("type");
	return !type || type.valueMatches(/submit|image/);
}

function isAssociated(id: string, node: HtmlElement): boolean {
	const form = node.getAttribute("form");
	return Boolean(form?.valueMatches(id, true));
}

function hasNestedSubmit(form: HtmlElement): boolean {
	const matches = form
		.querySelectorAll("button,input")
		.filter(isSubmit)
		.filter((node) => !node.hasAttribute("form"));
	return matches.length > 0;
}

function hasAssociatedSubmit(document: DOMTree, form: HtmlElement): boolean {
	const { id } = form;
	if (!id) {
		return false;
	}
	const matches = document
		.querySelectorAll("button[form],input[form]")
		.filter(isSubmit)
		.filter((node) => isAssociated(id, node));
	return matches.length > 0;
}
