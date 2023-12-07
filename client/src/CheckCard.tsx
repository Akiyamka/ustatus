import { Show, For, createResource, Suspense } from 'solid-js';
import { formatDistanceToNow } from 'date-fns';
import { api } from 'api';
import s from 'CheckCard.module.css';
import type { CheckConfig, RecordedCheckResult, CheckResult } from 'types/Check';

function getStatusClass(status: number) {
	return {
		[s.successStatus]: status < 300,
		[s.warningStatus]: status >= 300 && status < 400,
		[s.errorStatus]: status >= 400,
	};
}

function CheckCardHeader({ name }: { name: string }) {
	return (
		<div class={s.cardHeader}>
			<span class={s.checkName}>{name}</span>
		</div>
	);
}

function StatusSection({
	currentCheckState,
	timestamp,
}: {
	currentCheckState?: CheckResult;
	timestamp?: number;
}) {
	const timeDistance = () =>
		timestamp ? `Checked ${formatDistanceToNow(new Date(timestamp))}` : 'Last check';
	return currentCheckState ? (
		<div class={s.statusSection}>
			<span class={s.sectionName}>Checked {timeDistance()}:</span>
			<div class={s.status}>
				<div
					class={s.statusIndicator}
					classList={getStatusClass(currentCheckState.status_code)}
				></div>
				<div class={s.statusDetails}>
					<div class={s.statusName}>{currentCheckState.status_code}</div>
					<div class={s.statusMessage}>{currentCheckState.comment}</div>
				</div>
			</div>
		</div>
	) : null;
}

function HistorySection({ checkHistory }: { checkHistory: RecordedCheckResult[] }) {
	return (
		<Show when={checkHistory.length > 0} fallback={null}>
			<div class={s.historySection}>
				<span class={s.sectionName}>Historical log:</span>
				<div class={s.checksGrid}>
					<For each={checkHistory}>
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
	console.log(checks);
	return 90;
}
function UptimeSection({ checkHistory }: { checkHistory: RecordedCheckResult[] }) {
	const uptime = calculateUptime(checkHistory);
	return (
		<div class={s.uptimeSection}>
			<span class={s.sectionName}>Uptime:</span>
			<div class={s.uptime}>{uptime}%</div>
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

	setInterval(() => refetch, 1000000000);

	return (
		<div class={s.checkCard}>
			<CheckCardHeader name={check.name} />
			<div class={s.checkCardBody}>
				<Suspense fallback={<div>Loading...</div>}>
					<StatusSection
						currentCheckState={currentCheckState()}
						timestamp={currentCheckState()?.timestamp}
					/>
				</Suspense>
				<HistorySection checkHistory={checkHistory()} />
				<UptimeSection checkHistory={checkHistory()} />
			</div>
		</div>
	);
}
