export interface CheckConfig {
	id: number;
	name: string;
	description?: string;
	url: string;
	parameters?: RequestInit;
	created_at: number;
}

export interface CheckResult {
	status_code: number;
	comment?: string;
	check_id: number;
}

export interface RecordedCheckResult extends CheckResult {
	record_id: string;
	created_at: number;
}
