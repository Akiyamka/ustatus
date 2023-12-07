import type { DBClient } from './db';

export class RestApi {
	db;
	headers;
	constructor(db: DBClient) {
		this.db = db;
		this.headers = {
			'Access-Control-Allow-Origin': 'https://dn-status.surge.sh',
		};
	}

	async history() {
		return Response.json(await this.db.getHistory(), {
			headers: this.headers,
		});
	}

	async checks() {
		return Response.json(await this.db.getChecks(), {
			headers: this.headers,
		});
	}
}
