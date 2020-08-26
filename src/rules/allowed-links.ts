import { DynamicValue } from "../dom";
import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export const enum Style {
	EXTERNAL = "external",
	RELATIVE_BASE = "relative-base",
	RELATIVE_PATH = "relative-path",
	ABSOLUTE = "absolute",
	ANCHOR = "anchor",
}

interface RuleOptions {
	allowExternal: boolean;
	allowRelative: boolean;
	allowAbsolute: boolean;
	allowBase: boolean;
}

const defaults: RuleOptions = {
	allowExternal: true,
	allowRelative: true,
	allowAbsolute: true,
	allowBase: true,
};

const mapping: Record<string, string> = {
	a: "href",
	img: "src",
	link: "href",
	script: "src",
};

const description: Record<Style, string> = {
	[Style.EXTERNAL]: "External links are not allowed by current configuration.",
	[Style.RELATIVE_BASE]:
		"Links relative to <base> are not allowed by current configuration.",
	[Style.RELATIVE_PATH]:
		"Relative links are not allowed by current configuration.",
	[Style.ABSOLUTE]: "Absolute links are not allowed by current configuration.",
	[Style.ANCHOR]: undefined,
};

export default class AllowedLinks extends Rule<Style, RuleOptions> {
	public constructor(options: RuleOptions) {
		super(Object.assign({}, defaults, options));
	}

	public documentation(context: Style): RuleDocumentation {
		const message =
			description[context] ||
			"This link type is not allowed by current configuration";
		return {
			description: message,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (!this.isRelevant(event)) {
				return;
			}

			const link = event.value.toString();
			const style = this.getStyle(link);

			switch (style) {
				case Style.ANCHOR:
					/* anchor links are always allowed by this rule */
					break;

				case Style.ABSOLUTE:
					this.handleAbsolute(event, style);
					break;

				case Style.EXTERNAL:
					this.handleExternal(event, style);
					break;

				case Style.RELATIVE_BASE:
					this.handleRelativeBase(event, style);
					break;

				case Style.RELATIVE_PATH:
					this.handleRelativePath(event, style);
					break;
			}
		});
	}

	protected isRelevant(event: AttributeEvent): boolean {
		const { target, key, value } = event;

		/* don't check links with dynamic values */
		if (value instanceof DynamicValue) {
			return false;
		}

		const attr = mapping[target.tagName];
		return attr && attr === key;
	}

	protected getStyle(value: string): Style {
		/* http://example.net or //example.net */
		if (value.match(/^([a-z]+:)?\/\//g)) {
			return Style.EXTERNAL;
		}
		switch (value[0]) {
			/* /foo/bar */
			case "/":
				return Style.ABSOLUTE;
			/* ../foo/bar */
			case ".":
				return Style.RELATIVE_PATH;
			/* #foo */
			case "#":
				return Style.ANCHOR;
			/* foo/bar */
			default:
				return Style.RELATIVE_BASE;
		}
	}

	protected handleAbsolute(event: AttributeEvent, style: Style): void {
		const { allowAbsolute } = this.options;
		if (!allowAbsolute) {
			this.report(
				event.target,
				"Link destination must not be absolute url",
				event.valueLocation,
				style
			);
		}
	}

	private handleExternal(event: AttributeEvent, style: Style): void {
		const { allowExternal } = this.options;
		if (!allowExternal) {
			this.report(
				event.target,
				"Link destination must not be external url",
				event.valueLocation,
				style
			);
		}
	}

	private handleRelativePath(event: AttributeEvent, style: Style): void {
		const { allowRelative } = this.options;
		if (!allowRelative) {
			this.report(
				event.target,
				"Link destination must not be relative url",
				event.valueLocation,
				style
			);
		}
	}

	private handleRelativeBase(event: AttributeEvent, style: Style): void {
		const { allowRelative, allowBase } = this.options;
		if (!allowRelative) {
			this.report(
				event.target,
				"Link destination must not be relative url",
				event.valueLocation,
				style
			);
		} else if (!allowBase) {
			this.report(
				event.target,
				"Relative links must be relative to current folder",
				event.valueLocation,
				style
			);
		}
	}
}
