const { minVersion, minSatisfying } = require("semver");
const { jest } = require("../package.json").peerDependencies;

const constraint = process.argv[2];
const pkgname = process.argv[3] || "";
const minRequiredJest = jest.split("||").map((it) => minVersion(it.trim()));
const foundJest = minSatisfying(minRequiredJest, constraint);

const types = {
	27: "27",
	28: "27",
	29: "29",
};

const tsjest = {
	27: "27.1",
	28: "28",
	29: "29",
};

const typescript = {
	27: "4.6",
	28: "4.8",
	29: "4.8",
};

if (!foundJest) {
	process.stderr.write(`Failed to find a jest version that satisfies "${constraint}"\n`);
	process.stderr.write(`The current peerDependency allows: "${jest}"\n`);
	process.exit(1); // eslint-disable-line n/no-process-exit -- want early exit
}

if (!typescript[constraint]) {
	process.stderr.write(`Failed to find a typescript version that matches jest "${constraint}"\n`);
	process.exit(1); // eslint-disable-line n/no-process-exit -- want early exit
}

switch (pkgname) {
	case "":
		break;
	case "jest":
		process.stdout.write(`${foundJest.version}\n`);
		break;
	case "ts-jest":
		process.stdout.write(`${tsjest[constraint]}\n`);
		break;
	case "typescript":
		process.stdout.write(`${typescript[constraint]}\n`);
		break;
	case "@types/jest":
		process.stdout.write(`${types[constraint]}\n`);
		break;
	default:
		process.stderr.write(`Don't know how to handle package "${pkgname}"\n`);
		process.exit(1); // eslint-disable-line n/no-process-exit -- want early exit
}
