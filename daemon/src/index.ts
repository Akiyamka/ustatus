import { checkAll } from './checker';
import { DBClient } from './db';
import { RestApi } from './handlers';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const db = new DBClient(env);
		const url = new URL(request.url);
		const rest = new RestApi(db);

		switch (url.pathname) {
			case '/api/history':
			case '/api/history/':
				return rest.history();

			case '/api/checks':
			case '/api/checks/':
				return rest.checks();

			default:
				return new Response('This page not exist', { status: 404 });
		}
	},

	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const db = new DBClient(env);
		const checks = await db.getChecks();
		const results = await checkAll(checks);
		const { success } = await db.addHistoryRecords(results);
		if (!success) {
			console.error('Insert query failed');
		}
	},
};
