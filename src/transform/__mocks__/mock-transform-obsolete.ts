import { type Transformer } from "..";
import { type Source } from "../../context";

/**
 * Transformer returning a single mocked source.
 */
function mockTransform(): Iterable<Source> {
	return [];
}

mockTransform.api = 0;

module.exports = mockTransform as Transformer;
