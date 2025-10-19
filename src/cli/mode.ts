/**
 * @internal
 */
export enum Mode {
	LINT,
	INIT,
	DUMP_EVENTS,
	DUMP_TOKENS,
	DUMP_TREE,
	DUMP_SOURCE,
	PRINT_CONFIG,
}

/**
 * @internal
 */
export function modeToFlag(mode: Mode.LINT): null;
export function modeToFlag(mode: Exclude<Mode, Mode.LINT>): string;
export function modeToFlag(mode: Mode): string | null;
export function modeToFlag(mode: Mode): string | null {
	switch (mode) {
		case Mode.LINT:
			return null;
		case Mode.INIT:
			return "--init";
		case Mode.DUMP_EVENTS:
			return "--dump-events";
		case Mode.DUMP_TOKENS:
			return "--dump-tokens";
		case Mode.DUMP_TREE:
			return "--dump-tree";
		case Mode.DUMP_SOURCE:
			return "--dump-source";
		case Mode.PRINT_CONFIG:
			return "--print-config";
	}
}
