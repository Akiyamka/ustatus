
export interface Check {
	id: number;
	name: string;
	description?: string;
	url: string;
	parameters?: RequestInit<RequestInitCfProperties>;
	created_at: number;
}