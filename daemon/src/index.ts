import { error, json } from 'itty-router';
import { checkAll } from './checker';
import { DBClient } from './db';
import { corsify, router } from './router';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const db = new DBClient(env);

		router.get('/api/checks/history', () => db.getHistory());
		router.get<{ checkId: string }>('/api/checks/history/:checkId', ({ checkId }) =>
			db.getHistory(checkId)
		);
		router.get('/api/checks/settings', () => db.getChecks());
		router.get<{ checkId: string }>('/api/checks/settings/:checkId', ({ checkId }) =>
			db.getChecks(checkId)
		);
		router.get<{ checkId: string }>('/api/checks/run/:checkId', async ({ checkId }) => {
			const checks = await db.getChecks(checkId);
			console.log('checks', checks)
			const results = await checkAll(checks);
			console.log('results', results)
			return results;
		});

		// 404 for everything else
		router.all('*', () => new Response('Not Found.', { status: 404 }));

		return (
			router
				.handle(request, env, ctx)
				// turn any returned raw data into JSON
				.then(json)
				// catch errors BEFORE corsify
				.catch(error)
				// corsify all Responses (including errors)
				.then(corsify)
		);
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
