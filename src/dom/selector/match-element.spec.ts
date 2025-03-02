import { Config } from "../../config";
import { Parser } from "../../parser";
import { Selector } from "./selector";

let parser: Parser;

beforeAll(async () => {
	const resolvedConfig = await Config.empty().resolve();
	parser = new Parser(resolvedConfig);
});

it("should match simple selector", () => {
	expect.assertions(8);
	const markup = /* HTML */ ` <p class="foo">lorem <em>ipsum</em></p> `;
	const document = parser.parseHtml(markup);
	const p = document.querySelector("p")!;
	const em = document.querySelector("em")!;
	expect(new Selector("p").matchElement(p)).toBeTruthy();
	expect(new Selector("p").matchElement(em)).toBeFalsy();
	expect(new Selector("em").matchElement(p)).toBeFalsy();
	expect(new Selector("em").matchElement(em)).toBeTruthy();
	expect(new Selector("div").matchElement(p)).toBeFalsy();
	expect(new Selector("div").matchElement(em)).toBeFalsy();
	expect(new Selector(".foo").matchElement(p)).toBeTruthy();
	expect(new Selector(".foo").matchElement(em)).toBeFalsy();
});

it("should match simple selectors with descendant combinator", () => {
	expect.assertions(5);
	const markup = /* HTML */ `
		<div>
			<h1>lorem <em>ipsum</em></h1>
			<p>lorem <em>ipsum</em></p>
			<h2>lorem <em>ipsum</em></h2>
		</div>
	`;
	const document = parser.parseHtml(markup);
	const em = document.querySelector("p > em")!;
	expect(new Selector("p em").matchElement(em)).toBeTruthy();
	expect(new Selector("div em").matchElement(em)).toBeTruthy();
	expect(new Selector("div p em").matchElement(em)).toBeTruthy();
	expect(new Selector("h1 em").matchElement(em)).toBeFalsy();
	expect(new Selector("h2 em").matchElement(em)).toBeFalsy();
});

it("should match simple selectors with child combinator", () => {
	expect.assertions(5);
	const markup = /* HTML */ `
		<div>
			<h1>lorem <em>ipsum</em></h1>
			<p>lorem <em>ipsum</em></p>
			<h2>lorem <em>ipsum</em></h2>
		</div>
	`;
	const document = parser.parseHtml(markup);
	const em = document.querySelector("p > em")!;
	expect(new Selector("p > em").matchElement(em)).toBeTruthy();
	expect(new Selector("div > em").matchElement(em)).toBeFalsy();
	expect(new Selector("div > p > em").matchElement(em)).toBeTruthy();
	expect(new Selector("h1 > em").matchElement(em)).toBeFalsy();
	expect(new Selector("h2 > em").matchElement(em)).toBeFalsy();
});

it("should match simple selectors with adjacent sibling combinator", () => {
	expect.assertions(5);
	const markup = /* HTML */ `
		<div>
			<h1>lorem <em>ipsum</em></h1>
			<p>lorem <em>ipsum</em></p>
			<h2>lorem <em>ipsum</em></h2>
		</div>
	`;
	const document = parser.parseHtml(markup);
	const p = document.querySelector("p")!;
	const h2 = document.querySelector("h2")!;
	expect(new Selector("h1 + p").matchElement(p)).toBeTruthy();
	expect(new Selector("p + h2").matchElement(h2)).toBeTruthy();
	expect(new Selector("h2 + p").matchElement(p)).toBeFalsy();
	expect(new Selector("h1 + h2").matchElement(h2)).toBeFalsy();
	expect(new Selector("div + p").matchElement(p)).toBeFalsy();
});

it("should match simple selectors with general sibling combinator", () => {
	expect.assertions(5);
	const markup = /* HTML */ `
		<div>
			<h1>lorem <em>ipsum</em></h1>
			<p>lorem <em>ipsum</em></p>
			<h2>lorem <em>ipsum</em></h2>
		</div>
	`;
	const document = parser.parseHtml(markup);
	const p = document.querySelector("p")!;
	const h2 = document.querySelector("h2")!;
	expect(new Selector("h1 ~ p").matchElement(p)).toBeTruthy();
	expect(new Selector("p ~ h2").matchElement(h2)).toBeTruthy();
	expect(new Selector("h2 ~ p").matchElement(p)).toBeFalsy();
	expect(new Selector("h1 ~ h2").matchElement(h2)).toBeTruthy();
	expect(new Selector("div ~ p").matchElement(p)).toBeFalsy();
});
