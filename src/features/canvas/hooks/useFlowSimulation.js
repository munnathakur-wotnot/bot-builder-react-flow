import { useCallback, useRef, useState } from "react";

const STEP_DELAY = 1500; // ms between node executions

/**
 * Given nodes + edges, build an ordered traversal path starting from
 * the start node. Follows the first available outPort / successOutport.
 * Skips sub-nodes (carousel cards / buttons).
 */
function buildExecutionPath(nodes, edges) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Adjacency: source → [target, ...]
  const adj = {};
  for (const e of edges) {
    if (!adj[e.source]) adj[e.source] = [];
    adj[e.source].push(e.target);
  }

  const start = nodes.find((n) => n.data?.type === "start");
  if (!start) return [];

  const path = [];
  const visited = new Set();
  let current = start.id;

  while (current && !visited.has(current)) {
    const node = nodeMap[current];
    if (!node || node.data?.isSubNode) break;

    visited.add(current);
    path.push(current);

    const nexts = adj[current] ?? [];
    // prefer success outport edge first, then any next
    const next = nexts.find((id) => !nodeMap[id]?.data?.isSubNode) ?? null;
    current = next;
  }

  return path;
}

/**
 * External store for simulation state.
 * Consumers subscribe via useSyncExternalStore and receive per-node snapshots,
 * so only the affected node re-renders when simulation advances — not all nodes.
 */
function createSimulationStore() {
  let executedIdsSet = new Set();
  let activeId = null;
  const listeners = new Set();

  function notify() {
    listeners.forEach((fn) => fn());
  }

  return {
    getState: () => ({ executedIdsSet, activeId }),
    addExecutedId: (id) => {
      executedIdsSet = new Set(executedIdsSet);
      executedIdsSet.add(id);
      notify();
    },
    setActiveId: (id) => {
      activeId = id;
      notify();
    },
    reset: () => {
      executedIdsSet = new Set();
      activeId = null;
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useFlowSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  // Store is created once and never replaced — stable reference for context
  const storeRef = useRef(null);
  if (!storeRef.current) storeRef.current = createSimulationStore();
  const store = storeRef.current;

  const timeoutsRef = useRef([]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const stopSimulation = useCallback(() => {
    clearAll();
    setIsSimulating(false);
    store.reset();
  }, [clearAll, store]);

  const startSimulation = useCallback(
    (nodes, edges) => {
      if (isSimulating) return;

      const path = buildExecutionPath(nodes, edges);
      if (path.length === 0) return;

      setIsSimulating(true);
      store.reset();

      path.forEach((nodeId, index) => {
        const activateId = setTimeout(() => {
          store.setActiveId(nodeId);
          store.addExecutedId(nodeId);
        }, index * STEP_DELAY);

        timeoutsRef.current.push(activateId);
      });

      // finish
      const finishId = setTimeout(() => {
        store.setActiveId(null);
        setIsSimulating(false);
      }, path.length * STEP_DELAY);

      timeoutsRef.current.push(finishId);
    },
    [isSimulating, store],
  );

  return { isSimulating, simulationStore: store, startSimulation, stopSimulation };
}
