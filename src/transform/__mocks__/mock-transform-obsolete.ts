import { type Source } from "../../context";
import { type Transformer } from "..";

/**
 * Transformer returning a single mocked source.
 */
function mockTransform(): Iterable<Source> {
	return [];
}

mockTransform.api = 0;

module.exports = mockTransform as Transformer;
