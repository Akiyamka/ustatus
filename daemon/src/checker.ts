import { Check } from './types/Check';
import { HistoryRecord } from './types/HistoryRecord';

type CheckResult =
	| {
			check_id: number;
			response: Response;
			error?: undefined;
	  }
	| {
			check_id: number;
			error: string;
			response?: undefined;
	  };

async function performCheck({ parameters, url, id: check_id }: Check): Promise<CheckResult> {
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

function extractCheckResult(results: PromiseSettledResult<CheckResult>[]) {
	const checked: HistoryRecord[] = [];
	const failed: PromiseRejectedResult[] = [];
	results.forEach((result) => {
		if (result.status === 'fulfilled') {
			const { check_id, response, error } = result.value;
			checked.push(
				error
					? {
							checkId: check_id,
							status: 0,
							message: error,
					  }
					: {
							checkId: check_id,
							status: Number(response),
					  }
			);
		} else {
			failed.push(result);
		}
	});

	return [checked, failed] as const;
}

export async function checkAll(checks: Check[]) {
	const results = await Promise.allSettled(checks.map(performCheck));
	const [checked, failed] = extractCheckResult(results);

	if (failed.length > 0) {
		console.error(`Can't perform some checks (${failed.length})`);
	}

	return checked;
}
