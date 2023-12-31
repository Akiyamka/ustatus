import { error, json, withParams } from 'itty-router';
import { checkAll } from './checker';
import { DBClient } from './db';
import { corsify, router } from './router';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const db = new DBClient(env);

		router
			.all('*', withParams)
			.get('/api/checks/history', () => db.getHistory())
			.get<{ params: { checkId: string } }>(
				'/api/checks/history/:checkId',
				({ params }) => db.getHistory(params.checkId)
			)
			.get('/api/checks/settings', () => db.getChecks())
			.get<{ params: { checkId: string } }>(
				'/api/checks/settings/:checkId',
				({ params }) => db.getChecks(params.checkId)
			)
			.get('/api/checks/run/:checkId', async ({ params }) => {
				const { checkId } = params;
				const checks = await db.getChecks(checkId);
				const results = await checkAll(checks);
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
