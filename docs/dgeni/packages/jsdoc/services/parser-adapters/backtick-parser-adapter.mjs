/**
 * A ParserAdapter adapter that ignores tags between triple backtick blocks
 */
export default function backTickParserAdapter() {
	return {
		init() {
			this.inCode = false;
		},
		nextLine(line) {
			const CODE_FENCE = /^\s*```(?!.*```)/;
			if (CODE_FENCE.test(line)) {
				this.inCode = !this.inCode;
			}
		},
		parseForTags() {
			return !this.inCode;
		},
	};
}
