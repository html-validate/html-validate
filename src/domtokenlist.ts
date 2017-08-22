export class DOMTokenList extends Array<string> {
	readonly value: string;

	constructor(value: string){
		if (value){
			super(...value.split(' '));
		} else {
			super(0);
		}
		this.value = value;
	}

	item(n: number): string {
		return this[n];
	}

	contains(token: string): boolean {
		return this.indexOf(token) >= 0;
	}
}
