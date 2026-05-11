import { useEffect, useCallback } from "react";
import { INITIAL_NODES, INITIAL_EDGES } from "../constants";

const STORAGE_KEY_NODES = "flow_nodes";
const STORAGE_KEY_EDGES = "flow_edges";

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`[useLocalStorage] Failed to parse "${key}":`, e);
  }
  return fallback;
}

/** Returns persisted nodes/edges (or the INITIAL_* defaults). */
export function getPersistedFlow() {
  return {
    nodes: loadFromStorage(STORAGE_KEY_NODES, INITIAL_NODES),
    edges: loadFromStorage(STORAGE_KEY_EDGES, INITIAL_EDGES),
  };
}

/**
 * Syncs nodes & edges to localStorage whenever they change.
 *
 * @param {{ nodes: Node[], edges: Edge[] }} param0
 */
export function useLocalStorage({ nodes, edges }) {
  const persist = useCallback((key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[useLocalStorage] Failed to save "${key}":`, e);
    }
  }, []);

  useEffect(() => {
    persist(STORAGE_KEY_NODES, nodes);
  }, [nodes, persist]);

  useEffect(() => {
    persist(STORAGE_KEY_EDGES, edges);
  }, [edges, persist]);
}
