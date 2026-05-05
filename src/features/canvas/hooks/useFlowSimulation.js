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

export function useFlowSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [executedIds, setExecutedIds] = useState([]); // nodes already "done"
  const [activeId, setActiveId] = useState(null);     // currently executing
  const timeoutsRef = useRef([]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const stopSimulation = useCallback(() => {
    clearAll();
    setIsSimulating(false);
    setActiveId(null);
    setExecutedIds([]);
  }, [clearAll]);

  const startSimulation = useCallback(
    (nodes, edges) => {
      if (isSimulating) return;

      const path = buildExecutionPath(nodes, edges);
      if (path.length === 0) return;

      setIsSimulating(true);
      setExecutedIds([]);
      setActiveId(null);

      path.forEach((nodeId, index) => {
        // activate this node
        const activateId = setTimeout(() => {
          setActiveId(nodeId);
          setExecutedIds((prev) => [...prev, nodeId]);
        }, index * STEP_DELAY);

        timeoutsRef.current.push(activateId);
      });

      // finish
      const finishId = setTimeout(() => {
        setActiveId(null);
        setIsSimulating(false);
      }, path.length * STEP_DELAY);

      timeoutsRef.current.push(finishId);
    },
    [isSimulating],
  );

  return { isSimulating, executedIds, activeId, startSimulation, stopSimulation };
}
