import { For, Show, Suspense, createResource } from 'solid-js';
import s from './App.module.css';
import { CheckCard } from 'CheckCard';
import { api } from 'api';
import './index.css'

export function App() {
	const [checks] = createResource(() => api.fetchChecks(), {
		initialValue: [],
	});

	return (
		<div class={s.app}>
			<h1 class={s.title}>Disaster Ninja Status</h1>
			<div class={s.cardsGrid}>
				<Suspense fallback={<div>Loading...</div>}>
					<Show
						when={checks().length > 0}
						fallback={<h2 style={{ 'text-align': 'center' }}>No data available</h2>}
					>
						<For each={checks()}>{(check) => <CheckCard check={check} />}</For>
					</Show>
				</Suspense>
			</div>
		</div>
	);
}
