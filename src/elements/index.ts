import { type MetaDataTable } from "../meta";
import html5 from "./html5";

interface BundledElements {
	html5: MetaDataTable;
	[key: string]: MetaDataTable;
}

export const bundledElements: BundledElements = {
	html5,
};
