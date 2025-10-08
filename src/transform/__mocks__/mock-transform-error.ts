import { type Transformer, TRANSFORMER_API } from "..";
import { type Source } from "../../context";

/**
 * Mock transformer always failing with an exception
 */
function mockTransformError(): Iterable<Source> {
	throw new Error("Failed to frobnicate a baz");
}

mockTransformError.api = TRANSFORMER_API.VERSION;

module.exports = mockTransformError as Transformer;
