import { WritableStreamBuffer } from "stream-buffers";
import { CLI } from "../cli";
import { init } from "./init";

let stdout: WritableStreamBuffer;

beforeEach(() => {
	stdout = new WritableStreamBuffer();
});

it("should initialize project at given directory", async () => {
	expect.assertions(3);
	const cli = new CLI();
	const mockInit = jest.spyOn(cli, "init").mockResolvedValue({
		filename: "mock-filename",
	});
	const success = await init(cli, stdout, {
		cwd: "/path/to/project",
	});
	expect(success).toBeTruthy();
	expect(mockInit).toHaveBeenCalledWith("/path/to/project");
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"Configuration written to "mock-filename"
		"
	`);
});
