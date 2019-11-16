import { Source } from "../../context";
import { Transformer } from "..";

/**
 * Mock transformer always failing with an exception
 */
module.exports = function mockTransformError(): Iterable<Source> {
	throw new Error("Failed to frobnicate a baz");
} as Transformer;
