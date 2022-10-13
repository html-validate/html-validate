import { HtmlElement } from "../dom";
import { ElementReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl, SchemaObject } from "../rule";

export enum RuleContext {
	MISSING_ALT = "missing-alt",
	MISSING_HREF = "missing-href",
}

interface RuleOptions {
	accessible: boolean;
}

const defaults: RuleOptions = {
	accessible: true,
};

function findByTarget(target: string | null, siblings: HtmlElement[]): HtmlElement[] {
	return siblings.filter((it) => it.getAttributeValue("href") === target);
}

function getAltText(node: HtmlElement): string | null {
	return node.getAttributeValue("alt");
}

function getDescription(context?: RuleContext): string[] {
	switch (context) {
		case RuleContext.MISSING_ALT:
			return [
				"The `alt` attribute must be set (and not empty) when the `href` attribute is present on an `<area>` element.",
				"",
				"The attribute is used to provide an alternative text description for the area of the image map.",
				"The text should describe the purpose of area and the resource referenced by the `href` attribute.",
				"",
				"Either add the `alt` attribute or remove the `href` attribute.",
			];
		case RuleContext.MISSING_HREF:
			return [
				"The `alt` attribute must not be set when the `href` attribute is missing on an `<area>` element.",
				"",
				"Either add the `href` attribute or remove the `alt` attribute.",
			];
		default:
			return [
				"The `alt` attribute must only be used together with the `href` attribute.",
				"It must be set if `href` is present and must be omitted if `href` is missing",
				"",
				"The attribute is used to provide an alternative text description for the area of the image map.",
				"The text should describe the purpose of area and the resource referenced by the `href` attribute.",
			];
	}
}

export default class AreaAlt extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static schema(): SchemaObject {
		return {
			accessible: {
				type: "boolean",
			},
		};
	}

	public documentation(context?: RuleContext): RuleDocumentation {
		return {
			description: getDescription(context).join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", this.isRelevant, (event: ElementReadyEvent) => {
			const { target } = event;
			const siblings = target.querySelectorAll("area");

			for (const child of siblings) {
				this.validateArea(child, siblings);
			}
		});
	}

	protected validateArea(area: HtmlElement, siblings: HtmlElement[]): void {
		const { accessible } = this.options;
		const href = area.getAttribute("href");
		const alt = area.getAttribute("alt");
		if (href) {
			if (alt && alt.isDynamic) {
				return;
			}

			const target = area.getAttributeValue("href");
			const altTexts = accessible
				? [getAltText(area)]
				: findByTarget(target, siblings).map(getAltText);
			if (!altTexts.some(Boolean)) {
				this.report({
					node: area,
					message: `"alt" attribute must be set and non-empty when the "href" attribute is present`,
					location: alt ? alt.keyLocation : href.keyLocation,
					context: RuleContext.MISSING_ALT,
				});
			}
		} else if (alt) {
			this.report({
				node: area,
				message: `"alt" attribute cannot be used unless the "href" attribute is present`,
				location: alt.keyLocation,
				context: RuleContext.MISSING_HREF,
			});
		}
	}

	protected isRelevant(this: void, event: ElementReadyEvent): boolean {
		const { target } = event;
		return target.is("map");
	}
}
