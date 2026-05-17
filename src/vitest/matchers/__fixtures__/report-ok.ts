import { type Report, Reporter } from "../../../reporter";

export function reportOk(): Report {
	const reporter = new Reporter();
	return reporter.save();
}

export function reportOkAsync(): Promise<Report> {
	return Promise.resolve(reportOk());
}
