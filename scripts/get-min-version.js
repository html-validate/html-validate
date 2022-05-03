const { minVersion, minSatisfying } = require("semver");
const { jest } = require("../package.json").peerDependencies;

const constraint = process.argv[2];
const pkgname = process.argv[3] || "";
const minRequired = jest.split("||").map((it) => minVersion(it.trim()));
const found = minSatisfying(minRequired, constraint);
const typescript = {
	25: "3.9",
	26: "3.9",
	27: "4.6",
};

if (!found) {
	process.stderr.write(`Failed to find a jest version that satisfies "${constraint}"\n`);
	process.stderr.write(`The current peerDependency allows: "${jest}"\n`);
	process.exit(1); // eslint-disable-line no-process-exit
}

if (!typescript[constraint]) {
	process.stderr.write(`Failed to find a typescript version that matches jest ${constraint}\n`);
	process.exit(1); // eslint-disable-line no-process-exit
}

switch (pkgname) {
	case "":
		break;
	case "jest":
		process.stdout.write(`${found.version}\n`);
		break;
	case "typescript":
		process.stdout.write(`${typescript[constraint]}\n`);
		break;
	default:
		process.stderr.write(`Don't know how to handle package "${pkgname}"\n`);
		process.exit(1); // eslint-disable-line no-process-exit
}
