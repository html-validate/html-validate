/**
 * @public
 */
export const Node = {
	ELEMENT_NODE: 1 as 1 & { NODE_TYPE: 1 },
	TEXT_NODE: 3 as 3 & { NODE_TYPE: 3 },
	DOCUMENT_NODE: 9 as 9 & { NODE_TYPE: 9 },

	/** element wasn't closed */
	CLOSED_OPEN: 0 as 0 & { CLOSED: 0 },

	/** element closed with end tag <p>...</p> */
	CLOSED_END_TAG: 1 as 1 & { CLOSED: 1 },

	/** void element with omitted end tag <input> */
	CLOSED_VOID_OMITTED: 2 as 2 & { CLOSED: 2 },

	/** self-closed void element <input/> */
	CLOSED_VOID_SELF_CLOSED: 3 as 3 & { CLOSED: 3 },

	/** element with optional end tag <li>foo<li>bar */
	CLOSED_IMPLICIT_CLOSED: 4 as 4 & { CLOSED: 4 },
} as const;

/**
 * @public
 */
export type NodeType = typeof Node.ELEMENT_NODE | typeof Node.TEXT_NODE | typeof Node.DOCUMENT_NODE;

/**
 * @public
 */
export type NodeClosed =
	| typeof Node.CLOSED_OPEN
	| typeof Node.CLOSED_END_TAG
	| typeof Node.CLOSED_VOID_OMITTED
	| typeof Node.CLOSED_VOID_SELF_CLOSED
	| typeof Node.CLOSED_IMPLICIT_CLOSED;
