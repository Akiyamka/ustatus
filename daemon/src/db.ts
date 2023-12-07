import { Check } from './types/Check';
import { HistoryRecord } from './types/HistoryRecord';

interface CheckDTO extends Omit<Check, 'parameters'> {
	parameters?: string;
}

export class DBClient {
	db: D1Database;
	constructor(env: Env) {
		this.db = env.D1Database;
	}

	async addHistoryRecords(records: HistoryRecord[]) {
		if (records.length) {
			const transaction = this.db.prepare('INSERT INTO history (check_id, status_code, comment) VALUES (?1, ?2, ?3)');
			records.forEach(({ checkId, status, message }) => transaction.bind(checkId, status, message));
			const { success } = await transaction.run();
			return { success };
		}
		return { success: true };
	}

	async getChecks(): Promise<Check[]> {
		const { results, success, error } = await this.db.prepare('SELECT * FROM history').all();
		if (success) {
			return (results as unknown as CheckDTO[]).reduce((acc, r) => {
				try {
					if (typeof r.parameters === 'string') {
						acc.push({
							...r,
							parameters: JSON.parse(r.parameters),
						});
					} else {
						const { parameters, ...rest } = r;
						acc.push(rest);
					}
				} catch (e) {
					console.error(e);
				} finally {
					return acc;
				}
			}, [] as Check[]);
		} else {
			console.error(error);
			return [];
		}
	}

	async getHistory() {
		const { results } = await this.db.prepare('SELECT * FROM history ORDER BY created_at DESC LIMIT 100').all();
		return results;
	}
}
