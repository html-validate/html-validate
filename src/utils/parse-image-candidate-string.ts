/**
 * @internal
 */
export type ParsedImageCandidateDescriptor =
	| {
			url: string;
			descriptor: "width";
			value: number;
			raw: string;
	  }
	| {
			url: string;
			descriptor: "density";
			value: number;
			raw: string;
	  }
	| {
			url: string;
			descriptor: "none";
			raw: string | null;
	  };

/**
 * Parse descriptors from an image candidate string.
 *
 * @internal
 * @param srcset - Image candidate string to parse.
 * @returns Parsed descriptors from all candidates in the string.
 */
export function parseImageCandidateString(srcset: string): ParsedImageCandidateDescriptor[] {
	if (!srcset.trim()) {
		return [];
	}
	return srcset.split(",").map((candidate): ParsedImageCandidateDescriptor => {
		const parts = candidate.trim().split(/\s+/);
		const url = parts[0];
		if (!url) {
			return { url: "", descriptor: "none", raw: null };
		}

		if (parts.length < 2) {
			return { url, descriptor: "none", raw: null };
		}

		/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- parts.length >= 2 so at(-1) is always defined */
		const descriptor = parts.at(-1)!;

		if (/^\d+w$/i.test(descriptor)) {
			return {
				url,
				descriptor: "width",
				value: Number.parseInt(descriptor.slice(0, -1), 10),
				raw: descriptor,
			};
		}

		if (/^(?:\d*\.\d+|\d+(?:\.\d+)?)x$/i.test(descriptor)) {
			return {
				url,
				descriptor: "density",
				value: Number.parseFloat(descriptor.slice(0, -1)),
				raw: descriptor,
			};
		}

		return { url, descriptor: "none", raw: descriptor };
	});
}
