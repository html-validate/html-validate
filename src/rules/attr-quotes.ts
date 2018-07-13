import { Rule } from '../rule';
import { AttributeEvent } from '../event';

const defaults = {
	style: 'double',
	unquoted: false,
};

class AttrQuotes extends Rule {
	expected: string;

	constructor(options: object){
		super(Object.assign({}, defaults, options));
		this.expected = parseStyle(this.options.style);
	}

	setup(){
		this.on('attr', (event: AttributeEvent) => {
			/* ignore attributes with not value */
			if (typeof event.value === 'undefined'){
				return;
			}

			if (typeof event.quote === 'undefined'){
				if (this.options.unquoted === false){
					this.report(event.target, `Attribute "${event.key}" using unquoted value`);
				}
				return;
			}

			if (event.quote !== this.expected){
				this.report(event.target, `Attribute "${event.key}" used ${event.quote} instead of expected ${this.expected}`);
			}
		});
	}
}

function parseStyle(style: string){
	switch (style.toLowerCase()){
	case 'double': return '"';
	case 'single': return "'";
	default: return '"';
	}
}

module.exports = AttrQuotes;
