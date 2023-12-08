import { CheckConfig, CheckResult } from './types/Check';

type CheckResponse =
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

async function performCheck({
	parameters,
	url,
	id: check_id,
}: CheckConfig): Promise<CheckResponse> {
	try {
		const response = await (parameters ? fetch(url, parameters) : fetch(url));
		return { check_id, response };
	} catch (e) {
		if (typeof e === 'object' && e !== null && 'message' in e) {
			return { check_id, error: String(e.message) };
		} else {
			return { check_id, error: String('Unknown') };
		}
	}
}

function extractCheckResult(results: PromiseSettledResult<CheckResponse>[]) {
	const checked: CheckResult[] = [];
	const failed: PromiseRejectedResult[] = [];
	results.forEach((result) => {
		if (result.status === 'fulfilled') {
			const { check_id, response, error } = result.value;
			checked.push(
				error
					? {
							check_id,
							status_code: 0,
							comment: error,
					  }
					: {
							check_id,
							status_code: Number(response?.status),
							comment: response?.statusText,
					  }
			);
		} else {
			failed.push(result);
		}
	});

	return [checked, failed] as const;
}

export async function checkAll(checks: CheckConfig[]): Promise<CheckResult[]> {
	const results = await Promise.allSettled(checks.map(performCheck));
	const [checked, failed] = extractCheckResult(results);

	if (failed.length > 0) {
		console.error(`Can't perform some checks (${failed.length})`);
	}

	return checked;
}
