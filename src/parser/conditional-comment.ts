import { type Location, sliceLocation } from "../context";

export interface ConditionalComment {
	expression: string;
	location: Location;
}

const regexp = /<!(?:--)?\[(.*?)\](?:--)?>/g;

export function* parseConditionalComment(
	comment: string,
	commentLocation: Location,
): IterableIterator<ConditionalComment> {
	let match: RegExpExecArray | null;

	while ((match = regexp.exec(comment)) !== null) {
		const expression = match[1];
		const begin = match.index;
		const end = begin + match[0].length;
		const location = sliceLocation(commentLocation, begin, end, comment);
		yield {
			expression,
			location,
		};
	}
}
