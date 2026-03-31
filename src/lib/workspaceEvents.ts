type VoidFn = () => void;

const runListeners = new Set<VoidFn>();
const explainListeners = new Set<VoidFn>();

export function subscribeRun(fn: VoidFn): () => void {
  runListeners.add(fn);
  return () => runListeners.delete(fn);
}

export function subscribeExplain(fn: VoidFn): () => void {
  explainListeners.add(fn);
  return () => explainListeners.delete(fn);
}

export function emitRunQuery(): void {
  runListeners.forEach((fn) => fn());
}

export function emitExplainQuery(): void {
  explainListeners.forEach((fn) => fn());
}
