import { Mode, modeToFlag } from "./mode";

function isMode(value: string | Mode): value is Mode {
	return typeof value !== "string";
}

const modes: Array<[string, Mode]> = Object.values(Mode)
	.filter(isMode)
	.map((it) => [Mode[it], it]);

describe("modeToFlag() should convert to CLI flag name", () => {
	it.each(modes)("%s", (name, mode) => {
		expect.assertions(1);
		const result = modeToFlag(mode);
		expect([name, result]).toMatchSnapshot();
	});
});
