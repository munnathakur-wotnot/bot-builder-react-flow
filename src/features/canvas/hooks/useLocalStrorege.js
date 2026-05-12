import { useEffect, useCallback } from "react";
import {
  INITIAL_NODES,
  INITIAL_EDGES,
  INITIAL_NODE_ID_LOCAL,
} from "../constants";

const STORAGE_KEY_NODES = "flow_nodes";
const STORAGE_KEY_EDGES = "flow_edges";
const STORAGE_KEY_NODES_IDS = "flow_node_ids";

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
    currentId: loadFromStorage(STORAGE_KEY_NODES_IDS, INITIAL_NODE_ID_LOCAL),
  };
}

/**
 * Syncs nodes & edges to localStorage whenever they change.
 *
 * @param {{ nodes: Node[], edges: Edge[] }} param0
 */
export function useLocalStorage({ nodes, edges, nextIdRef }) {
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
  useEffect(() => {
    persist(STORAGE_KEY_NODES_IDS, nextIdRef);
  }, [nextIdRef, persist]);
}
