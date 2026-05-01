import { escapeSelectorComponent } from "./escape-selector-component";

/**
 * @internal
 */
export function generateIdSelector(id: string): string {
	const escaped = escapeSelectorComponent(id);
	return /^\d/.test(escaped) ? `[id="${escaped}"]` : `#${escaped}`;
}
