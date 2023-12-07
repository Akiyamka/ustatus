// Env interface not what I get in runtime
interface Env {
		// Binding to a D1 Database. Learn more at https://developers.cloudflare.com/workers/platform/bindings/#d1-database-bindings
	D1Database: D1Database;
}

interface CheckDTO {
	id: number;
	name: string;
	description?: string;
	url: string;
	parameters?: string;
	created_at: number;
}

interface Check extends Omit<CheckDTO, 'parameters'> {
	parameters?: RequestInit<RequestInitCfProperties>;
}

async function getChecks(db: D1Database): Promise<Check[]> {
	const { results, success, error } = await db.prepare('SELECT * FROM history').all();
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

function createRecorder(db: D1Database) {
	const insertion = db.prepare('INSERT INTO history (check_id, status_code, comment) VALUES (?1, ?2, ?3)');
	return {
		addRecord: (checkId: number, status: number, message?: string) => insertion.bind(checkId, status, message),
		save: () => insertion.run(),
	};
}

async function performCheck({ parameters, url, id: check_id }: Check) {
	try {
		const response = await (parameters ? fetch(url, parameters) : fetch(url));
		return { check_id, response };
	} catch (e) {
		if (e instanceof Error) {
			return { check_id, error: e.message };
		} else {
			return { check_id, error: String(e) };
		}
	}
}

async function getHistory(env: Env) {

	const { results } = await env.D1Database.prepare('SELECT * FROM history ORDER BY created_at DESC LIMIT 100').all();
  return results
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			case '/api/history':
			case '/api/history/':
				return Response.json(getHistory(env), { headers: {
					'Access-Control-Allow-Origin': 'https://akiyamka.github.io'
				}});
		
			default:
				return new Response('This page not exist', { status: 404 });
		}
	},

	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const checks = await getChecks(env.D1Database);
		const results = await Promise.allSettled(checks.map(performCheck));
		const { addRecord, save } = createRecorder(env.D1Database);
		results.forEach((result) => {
			if (result.status === 'fulfilled') {
				const { check_id, response, error } = result.value;
				if (error) {
					addRecord(check_id, 0, error);
				} else {
					addRecord(check_id, Number(response));
				}
			} else {
				console.error(result.reason);
			}
		});
		const { success } = await save();
		if (!success) {
			console.error('Insert query failed');
		}
	},
};
