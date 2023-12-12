import { CheckConfig } from './types/Check';
import { CheckResult } from './types/Check';

interface CheckDTO extends Omit<CheckConfig, 'parameters'> {
	parameters?: string;
}

export class DBClient {
	db: D1Database;
	constructor(env: Env) {
		this.db = env.D1Database;
	}

	async addHistoryRecords(records: CheckResult[]) {
		if (records.length) {
			let transaction = this.db.prepare(
				'INSERT INTO history (check_id, status_code, comment) VALUES (?1, ?2, ?3)'
			);
			records.forEach(
				({ check_id, status_code, comment }) =>
					(transaction = transaction.bind(check_id, status_code, comment))
			);
			const { success } = await transaction.run();
			return { success };
		}
		return { success: true };
	}

	async getChecks(checkId?: string): Promise<CheckConfig[]> {
		const { results, success, error } = await this.db
			.prepare(
				checkId ? `SELECT * FROM checks WHERE id = ${checkId}` : 'SELECT * FROM checks'
			)
			.all();
		if (success) {
			return (results as unknown as CheckDTO[]).reduce((acc, r) => {
				try {
					if (typeof r.parameters === 'string') {
						// const temp = r.parameters.replaceAll('\\\\', '\\');
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
			}, [] as CheckConfig[]);
		} else {
			console.error(error);
			return [];
		}
	}

	async getHistory(checkId?: string, limit = 12) {
		const { results } = await this.db
			.prepare(
				checkId
					? `SELECT * FROM history WHERE check_id = ${checkId} ORDER BY created_at DESC LIMIT ${limit}`
					: `SELECT * FROM history ORDER BY created_at DESC LIMIT ${limit}`
			)
			.all();
		return results;
	}
}
