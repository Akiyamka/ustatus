import type { CheckConfig, CheckResult, RecordedCheckResult } from './types/Check';

export class ApiClient {
	endpoint: string;
	constructor() {
		this.endpoint = `${import.meta.env.VITE_API_ENDPOINT}/api`;
	}

	async fetchChecks(): Promise<CheckConfig[]> {
		const response = await fetch(`${this.endpoint}/checks/settings`);
		return (await response.json()) as CheckConfig[];
	}

	async fetchCheckHistory(checkId: number): Promise<RecordedCheckResult[]> {
		const response = await fetch(`${this.endpoint}/checks/history/${checkId}`);
		return (await response.json()) as RecordedCheckResult[];
	}

	async runCheck(checkId: number): Promise<CheckResult & { timestamp: number }> {
		const response = await fetch(`${this.endpoint}/checks/run/${checkId}`);
		const json = (await response.json()) as CheckResult;
		return {
			...json,
			timestamp: Date.now(),
		};
	}
}
