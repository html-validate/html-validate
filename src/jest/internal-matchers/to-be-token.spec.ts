import { type Token, TokenType } from "../../lexer";
import { stripAnsi } from "../utils";
import "../jest-internal";

describe("toBeToken()", () => {
	const token: Token = {
		type: TokenType.TAG_OPEN,
		data: ["<foo", "", "foo"],
		location: {
			filename: "inline",
			line: 1,
			column: 2,
			offset: 1,
			size: 1,
		},
	};

	it("should pass if token matches", () => {
		expect.assertions(1);
		expect({ value: token }).toBeToken({
			type: TokenType.TAG_OPEN,
		});
	});

	it("should fail if token doesn't match", () => {
		expect.assertions(3);
		let error: any;
		try {
			expect({ value: token }).toBeToken({
				type: TokenType.TAG_CLOSE,
			});
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message || "")).toMatchSnapshot();
	});
});
