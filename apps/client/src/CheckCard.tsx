import { Show, For, createResource, Suspense, type Accessor } from 'solid-js';
import { formatDistanceToNow } from 'date-fns';
import { api } from 'api';
import s from 'CheckCard.module.css';
import type { CheckConfig, CheckResult, RecordedCheckResult } from '@ustatus/ustatus-types'


function getStatusClass(status: number) {
	return {
		[s.successStatus]: status < 300,
		[s.warningStatus]: status >= 300 && status < 400,
		[s.errorStatus]: status >= 400,
	};
}

function CheckCardHeader({ name, description }: { name: string; description?: string }) {
	return (
		<div class={s.cardHeader}>
			<span class={s.checkName}>{name}</span>
			<Show when={description}>
				{(descr) => <span class={s.checkDescription}>{descr()}</span>}
			</Show>
		</div>
	);
}

function StatusSection({
	currentCheckState,
	timestamp,
}: {
	currentCheckState: Accessor<CheckResult | undefined>;
	timestamp: Accessor<number | undefined>;
}) {
	const timeDistance = () => {
		const time = timestamp();
		return time ? `Last check ${formatDistanceToNow(new Date(time))}` : 'Last check';
	};

	return (
		<Show when={currentCheckState()}>
			{(check) => (
				<div class={s.statusSection}>
					<span class={s.sectionName}>{timeDistance()}:</span>
					<div class={s.status}>
						<div
							class={s.statusIndicator}
							classList={getStatusClass(check().status_code)}
						></div>
						<div class={s.statusDetails}>
							<div class={s.statusName}>{check().status_code}</div>
							<div class={s.statusMessage}>{check().comment}</div>
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}

function HistorySection({
	checkHistory,
}: {
	checkHistory: Accessor<RecordedCheckResult[]>;
}) {
	return (
		<Show when={checkHistory().length > 0} fallback={null}>
			<div class={s.historySection}>
				<span class={s.sectionName}>Historical log:</span>
				<div class={s.checksGrid}>
					<For each={checkHistory()}>
						{(check) => (
							<div
								class={s.checkRecord}
								classList={getStatusClass(check.status_code)}
								title={new Date(check.created_at).toLocaleDateString()}
							></div>
						)}
					</For>
				</div>
			</div>
		</Show>
	);
}

function calculateUptime(checks: RecordedCheckResult[]) {
	return checks.length
		? `${(
				checks.filter((c) => c.status_code >= 200 && c.status_code < 299).length /
				(checks.length / 100)
			).toFixed(2)}%`
		: 'Unknown';
}
function UptimeSection({
	checkHistory,
}: {
	checkHistory: Accessor<RecordedCheckResult[]>;
}) {
	const uptime = () => calculateUptime(checkHistory());
	return (
		<div class={s.uptimeSection}>
			<span class={s.sectionName}>Uptime:</span>
			<div class={s.uptime}>{uptime()}</div>
		</div>
	);
}

export function CheckCard({ check }: { check: CheckConfig }) {
	const [checkHistory] = createResource(
		check.id,
		(checkId: number) => api.fetchCheckHistory(checkId),
		{ initialValue: [] },
	);

	const [currentCheckState, { refetch }] = createResource(check, (check: CheckConfig) =>
		api.runCheck(check.id),
	);

	setInterval(() => refetch, 180000); // 3 min

	return (
		<div class={s.checkCard}>
			<CheckCardHeader name={check.name} description={check.description} />
			<div class={s.checkCardBody}>
				<Suspense fallback={<div>Loading...</div>}>
					<StatusSection
						currentCheckState={currentCheckState}
						timestamp={() =>
							currentCheckState ? currentCheckState()?.timestamp : undefined
						}
					/>
					<HistorySection checkHistory={checkHistory} />
					<UptimeSection checkHistory={checkHistory} />
				</Suspense>
			</div>
		</div>
	);
}
