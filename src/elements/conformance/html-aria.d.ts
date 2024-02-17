declare const data: Array<{
	id: string;
	hash: [string, string, string];
	description: string;
	selector: string;
	markup: string;
	role: string | null;
	naming: "allowed" | "prohibited";
}>;

export = data;
