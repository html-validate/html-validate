import { Rule } from '../rule';
import { DOMReadyEvent } from '../event';

class MissingDoctype extends Rule {
	setup(){
		this.on('dom:ready', (event: DOMReadyEvent) => {
			const dom = event.document;
			if (!dom.doctype){
				this.report(dom.root, `Document is missing doctype`);
			}
		});
	}
}

module.exports = MissingDoctype;
