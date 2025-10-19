import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class PreferTbody extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: `While \`<tbody>\` is optional is relays semantic information about its contents. Where applicable it should also be combined with \`<thead>\` and \`<tfoot>\`.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			for (const table of doc.querySelectorAll("table")) {
				if (table.querySelector("> tbody")) {
					continue;
				}

				const tr = table.querySelectorAll("> tr");
				if (tr.length >= 1) {
					this.report(tr[0], "Prefer to wrap <tr> elements in <tbody>");
				}
			}
		});
	}
}
