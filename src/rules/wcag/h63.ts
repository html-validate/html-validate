import { type HtmlElement, DynamicValue } from "../../dom";
import html5 from "../../elements/html5";
import { type ElementReadyEvent } from "../../event";
import { type MetaAttribute } from "../../meta";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../../rule";
import { naturalJoin } from "../../utils/natural-join";

interface RuleOptions {
	strict: boolean;
}

const defaults: RuleOptions = {
	strict: false,
};

/* istanbul ignore next: this will always be present for the <th>
 * attribute (or the tests would fail) */
const { enum: validScopes } = html5.th.attributes?.scope as MetaAttribute & { enum: string[] };

const joinedScopes = naturalJoin(validScopes);

const td = 0;
const th = 1;

function getShape(cells: number[][]): { rows: number; cols: number } {
	const rows = cells.length;
	const cols = cells[0].length;
	return { rows, cols };
}

/**
 * @internal
 */
export function isSimpleTable(table: HtmlElement): boolean {
	/* if any td/th have the headers attribute it is a complex table */
	const haveHeadersAttr = table.querySelector("> tr > [headers], > tbody > tr > [headers]");
	if (haveHeadersAttr) {
		return false;
	}

	/* if there are no rows in table assume it is a complex table (but wont really
	 * matter as there will be no cells yet) */
	const rows = table.querySelectorAll("> tr, > thead > tr, > tbody > tr");
	if (rows.length === 0) {
		return false;
	}

	/* if there are no td/th in the tr assume it is a complex table */
	const cells = rows.map((tr) => tr.querySelectorAll("> *").map((el) => (el.is("th") ? th : td)));
	if (cells[0].length === 0) {
		return false;
	}

	/* if the number of columns differ in any row assume it is a complex table
	 * (either it is malformed or it uses col- or rowspan) */
	const numColumns = cells[0].length;
	if (!cells.every((row) => row.length === numColumns)) {
		return false;
	}

	const shape = getShape(cells);
	const headersPerRow = cells.map((row) => row.reduce<number>((sum, cell) => sum + cell, 0));
	const headersPerColumn = Array(shape.cols)
		.fill(0)
		.map((_, index) => {
			return cells.reduce((sum, it) => sum + it[index], 0);
		});

	/* case 1: all th in first row */
	const [firstRow, ...otherRows] = headersPerRow;
	if (firstRow === shape.cols && otherRows.every((row) => row === 0)) {
		return true;
	}

	/* case 2: all th in first column */
	const [firstCol, ...otherCols] = headersPerColumn;
	const haveThead = Boolean(table.querySelector("> thead"));
	if (firstCol === shape.rows && otherCols.every((col) => col === 0) && !haveThead) {
		return true;
	}

	return false;
}

export default class H63 extends Rule<void, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static override schema(): SchemaObject {
		return {
			strict: {
				type: "boolean",
			},
		};
	}

	public override documentation(): RuleDocumentation {
		return {
			description:
				"H63: Using the scope attribute to associate header cells and data cells in data tables",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const { strict } = this.options;
		this.on("element:ready", (event: ElementReadyEvent) => {
			const node = event.target;
			if (!node.is("table")) {
				return;
			}

			if (strict || !isSimpleTable(node)) {
				this.validateTable(node);
			}
		});
	}

	private validateTable(node: HtmlElement): void {
		for (const th of node.querySelectorAll("th")) {
			const scope = th.getAttribute("scope");
			const value = scope?.value;

			/* ignore dynamic scope */
			if (value instanceof DynamicValue) {
				continue;
			}

			/* ignore elements with valid scope values */
			if (value && validScopes.includes(value)) {
				continue;
			}

			const message = `<th> element must have a valid scope attribute: ${joinedScopes}`;
			const location = scope?.valueLocation ?? scope?.keyLocation ?? th.location;
			this.report(th, message, location);
		}
	}
}
