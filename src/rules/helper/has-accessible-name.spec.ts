import { Config } from "../../config";
import { Source } from "../../context";
import { DynamicValue, HtmlElement } from "../../dom";
import { Parser } from "../../parser";
import { processAttribute } from "../../transform/mocks/attribute";
import { hasAccessibleName } from "./has-accessible-name";

const config = Config.empty();
const parser = new Parser(config.resolve());

function processElement(node: HtmlElement): void {
	if (node.hasAttribute("bind-text")) {
		node.appendText(new DynamicValue(""), {
			filename: "mock",
			line: 1,
			column: 1,
			offset: 0,
			size: 1,
		});
	}
}

function parse(
	markup: string,
	selector: string = "p",
): { root: HtmlElement; element: HtmlElement } {
	const source: Source = {
		filename: "inline",
		line: 1,
		column: 1,
		offset: 0,
		data: markup,
		hooks: {
			processAttribute,
			processElement,
		},
	};
	const root = parser.parseHtml(source);
	const element = root.querySelector(selector)!;
	return { root, element };
}

describe("self", () => {
	it("should return false if element has no text", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p></p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return true if element has static text", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p>lorem ipsum</p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if element has dynamic text", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p bind-text="myVar"></p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if element has static aria-label", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p aria-label="lorem ipsum"></p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if element has dynamic aria-label", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p dynamic-aria-label="myVar"></p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return false if element has empty aria-label", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p aria-label=""></p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return false if element has whitespace only in aria-label", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p aria-label=" "></p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return false if element is hidden", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p hidden>lorem ipsum</p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return false if element is aria-hidden", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p aria-hidden="true">lorem ipsum</p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return true if <img> has static alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img alt="lorem ipsum" /> `;
		const { root, element } = parse(markup, "img");
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if <img> has dynamic alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img dynamic-alt="myVar" /> `;
		const { root, element } = parse(markup, "img");
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return false if <img> has empty alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img alt="" /> `;
		const { root, element } = parse(markup, "img");
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return false if <img> is missing alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img /> `;
		const { root, element } = parse(markup, "img");
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return true if <svg> has non-empty <title>", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <svg><title>lorem ipsum</title></svg> `;
		const { root, element } = parse(markup, "svg");
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return false if <svg> has empty <title>", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <svg><title></title></svg> `;
		const { root, element } = parse(markup, "svg");
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return false if <svg> is missing <title>", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <svg></svg> `;
		const { root, element } = parse(markup, "svg");
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});
});

describe("aria-labelledby", () => {
	it("should return false if referenced element has no text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref"></div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return true if referenced element has static text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref">lorem ipsum</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if referenced element has dynamic text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref" bind-text="foo"></div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if one referenced element has text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="a"></div>
			<div id="b">lorem ipsum</div>
			<div id="c"></div>
			<p aria-labelledby="a b c"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return false if none of referenced element has text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="a"></div>
			<div id="b"></div>
			<div id="c"></div>
			<p aria-labelledby="a b c"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return true if element has dynamic aria-labelledby", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p dynamic-aria-labelledby="ref"></p> `;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if referenced element has static aria-label", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref" aria-label="lorem ipsum"></div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if referenced element has dynamic aria-label", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref" dynamic-aria-label="myVar"></div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return false if referenced element has empty aria-label", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref" aria-label=""></div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return true even if referenced element is hidden", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref" hidden>lorem ipsum</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true even if referenced element is aria-hidden", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref" aria-hidden="true">lorem ipsum</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return false if referenced element children is hidden", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref">
				<em hidden> lorem ipsum </em>
			</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return false if referenced element children is aria-hidden", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref">
				<em aria-hidden="true"> lorem ipsum </em>
			</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return true if referenced <img> has static alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<img id="ref" alt="lorem ipsum" />
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if referenced <img> has dynamic alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<img id="ref" dynamic-alt="myVar" />
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return false if referenced <img> has empty alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<img id="ref" alt="" />
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return false if referenced <img> is missing alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<img id="ref" />
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return true if nested <img> has static alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref">
				<img alt="lorem ipsum" />
			</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return true if nested <img> has dynamic alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref">
				<img dynamic-alt="myVar" />
			</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeTruthy();
	});

	it("should return false if nested <img> has empty alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref">
				<img alt="" />
			</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return false if nested <img> is missing alt text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref">
				<img />
			</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should return false if nested <img> with alt text is hidden", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div id="ref">
				<img hidden alt="lorem ipsum" />
				<img aria-hidden="true" alt="lorem ipsum" />
			</div>
			<p aria-labelledby="ref"></p>
		`;
		const { root, element } = parse(markup);
		expect(hasAccessibleName(root, element)).toBeFalsy();
	});

	it("should not look up recursive aria-labelledby", () => {
		expect.assertions(4);
		const markup = /* HTML */ `
			<p id="a" aria-labelledby="b"></p>
			<p id="b" aria-labelledby="a"></p>

			<p id="c" aria-labelledby="d">d</p>
			<p id="d" aria-labelledby="c">c</p>
		`;
		const { root } = parse(markup);
		const elements = root.querySelectorAll("p");
		expect(hasAccessibleName(root, elements[0])).toBeFalsy();
		expect(hasAccessibleName(root, elements[1])).toBeFalsy();
		expect(hasAccessibleName(root, elements[2])).toBeTruthy();
		expect(hasAccessibleName(root, elements[3])).toBeTruthy();
	});
});
