const fs = require("fs");
const crypto = require("crypto");

module.exports = {
	name: "assetHash",
	process: (asset) => {
		const filename = `public/${asset}`;
		if (fs.existsSync(filename)) {
			const data = fs.readFileSync(filename);
			const hash = crypto.createHash("md5").update(data).digest("hex");
			return `${asset}?${hash}`;
		} else {
			console.log(
				`${filename} does not exist when trying to calculate asset hash.`
			);
			return asset;
		}
	},
};
