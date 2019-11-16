import { Source } from "../../context";
import { Transformer, TRANSFORMER_API } from "..";

/**
 * Mock transformer always failing with an exception
 */
function mockTransformError(): Iterable<Source> {
	throw new Error("Failed to frobnicate a baz");
}

mockTransformError.api = TRANSFORMER_API.VERSION;

module.exports = mockTransformError as Transformer;
