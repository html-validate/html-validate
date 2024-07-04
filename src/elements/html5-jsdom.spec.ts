/* @jest-environment jsdom */
import { type MetaAttribute } from "../meta";
import html5 from "./html5";

const markup = /* HTML */ `
	<a id="link-1" href="." download>link 1</a>
	<a id="link-2" download>link 1</a>
`;

it("html5 element metadata should be jsdom-compatible", () => {
	expect.assertions(2);
	document.body.innerHTML = markup;
	const [link1, link2] = Array.from(document.querySelectorAll("a"));
	const download = html5.a.attributes!.download as MetaAttribute;
	const allowed = download.allowed!;
	expect(allowed(link1, link1.getAttribute("download"))).toBeNull();
	expect(allowed(link2, link2.getAttribute("download"))).toBe(
		'requires "href" attribute to be present',
	);
});
