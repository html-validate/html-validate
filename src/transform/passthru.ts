const fs = require('fs');

module.exports = function passthruTransform(filename: string) {
	return fs.readFileSync(filename, {encoding: 'utf8'});
};
