import { WritableStreamBuffer } from "stream-buffers";
import { Config, HtmlValidate } from "../..";
import { printConfig } from "./print-config";

let stdout: WritableStreamBuffer;

beforeEach(() => {
	stdout = new WritableStreamBuffer();
});

it("should print config for given filename", async () => {
	expect.assertions(3);
	const htmlvalidate = new HtmlValidate();
	const config = Config.defaultConfig().resolve();
	const getConfigFor = jest.spyOn(htmlvalidate, "getConfigFor").mockResolvedValue(config);
	const success = await printConfig(htmlvalidate, stdout, ["/path/to/my/file.html"]);
	expect(success).toBeTruthy();
	expect(getConfigFor).toHaveBeenCalledWith("/path/to/my/file.html");
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"{
		  "extends": [],
		  "plugins": [],
		  "rules": {},
		  "transform": {}
		}
		"
	`);
});

it("should return unsuccessful if passing multiple filenames", async () => {
	expect.assertions(2);
	const htmlvalidate = new HtmlValidate();
	const success = await printConfig(htmlvalidate, stdout, [
		"/path/to/my/file.html",
		"/path/to/another/file.html",
	]);
	expect(success).toBeFalsy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"\`--print-config\` expected a single filename but got multiple:

		  - /path/to/my/file.html
		  - /path/to/another/file.html

		"
	`);
});
