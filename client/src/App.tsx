import { For, createResource } from 'solid-js';
import './App.css';

interface StatusCheckRecord {
  record_id: number;
  check_id: number;
  status_code: number;
  comment: string;
  created_at: number;
}

async function fetchHistory() {
  const response = await fetch('https://daemon.ustatus-daemon.workers.dev/api/history');
  return (await response.json()) as StatusCheckRecord[];
}

function App() {
  const [data, { refetch }] = createResource(fetchHistory);
  setInterval(() => refetch, 10000);
  return data.loading ? (
    'Loading...'
  ) : (
    <div>
      <For each={data()}>
        {(item, index) => (
          <div>
            #{index()} {item.status_code} {item.comment}
          </div>
        )}
      </For>
    </div>
  );
}

export default App;
