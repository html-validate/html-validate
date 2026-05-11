/**
 * @public
 */
export const Node = {
	ELEMENT_NODE: 1 as 1 & { NODE_TYPE: 1 },
	TEXT_NODE: 3 as 3 & { NODE_TYPE: 3 },
	DOCUMENT_NODE: 9 as 9 & { NODE_TYPE: 9 },
} as const;

/**
 * @public
 */
export type NodeType = typeof Node.ELEMENT_NODE | typeof Node.TEXT_NODE | typeof Node.DOCUMENT_NODE;
