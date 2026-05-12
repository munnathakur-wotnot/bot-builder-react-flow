import { useEffect, useRef } from "react";
import { EPHEMERAL_NODE_KEYS } from "../constants.js";
import { pushToastGlobal } from "../../../shared/ui/feedback/Toast.jsx";

const STORAGE_KEY = "flow_autosave";
const INTERVAL_MS = 5000;

// Fields compared to detect node modifications
const TRACKED_NODE_FIELDS = ["title", "description", "position"];

/** Strip ephemeral collab fields so they're never persisted */
function cleanNode(node) {
  const data = { ...node.data };
  EPHEMERAL_NODE_KEYS.forEach((k) => delete data[k]);
  return { ...node, data };
}

/** Shallow-compare tracked fields of two nodes */
function nodeChanged(prev, next) {
  if (
    prev.data.title !== next.data.title ||
    prev.data.description !== next.data.description
  )
    return true;
  if (
    prev.position.x !== next.position.x ||
    prev.position.y !== next.position.y
  )
    return true;
  return false;
}

/** Compute diff between last saved snapshot and current state */
function computeDiff(snapshot, nodes, edges) {
  const prevNodeMap = new Map((snapshot.nodes ?? []).map((n) => [n.id, n]));
  const prevEdgeIds = new Set((snapshot.edges ?? []).map((e) => e.id));

  const addedNodes = [];
  const modifiedNodes = [];

  nodes.forEach((n) => {
    const prev = prevNodeMap.get(n.id);
    if (!prev) {
      addedNodes.push(n.id);
    } else if (nodeChanged(prev, n)) {
      modifiedNodes.push(n.id);
    }
  });

  const currentNodeIds = new Set(nodes.map((n) => n.id));
  const removedNodes = [...prevNodeMap.keys()].filter(
    (id) => !currentNodeIds.has(id),
  );

  const addedEdges = edges.filter((e) => !prevEdgeIds.has(e.id)).map((e) => e.id);
  const currentEdgeIds = new Set(edges.map((e) => e.id));
  const removedEdges = [...prevEdgeIds].filter((id) => !currentEdgeIds.has(id));

  return { addedNodes, modifiedNodes, removedNodes, addedEdges, removedEdges };
}

/** Build a human-readable summary string from a diff */
function diffSummary(diff) {
  const parts = [];
  if (diff.addedNodes.length)
    parts.push(`+${diff.addedNodes.length} node${diff.addedNodes.length > 1 ? "s" : ""}`);
  if (diff.removedNodes.length)
    parts.push(`-${diff.removedNodes.length} node${diff.removedNodes.length > 1 ? "s" : ""}`);
  if (diff.modifiedNodes.length)
    parts.push(`~${diff.modifiedNodes.length} modified`);
  if (diff.addedEdges.length)
    parts.push(`+${diff.addedEdges.length} edge${diff.addedEdges.length > 1 ? "s" : ""}`);
  if (diff.removedEdges.length)
    parts.push(`-${diff.removedEdges.length} edge${diff.removedEdges.length > 1 ? "s" : ""}`);
  return parts.join(", ");
}

/** Load the last saved snapshot from localStorage */
export function loadAutoSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("[useAutoSave] Failed to read snapshot:", e);
  }
  return null;
}

/**
 * Every INTERVAL_MS seconds:
 *   1. Compute diff between current nodes/edges and last saved snapshot
 *   2. If anything changed, write the full clean state to localStorage
 *   3. Show a toast summarising what changed
 *
 * @param {{ nodes: Node[], edges: Edge[], nextIdRef: React.MutableRefObject<number> }} param0
 */
export function useAutoSave({ nodes, edges, nextIdRef }) {
  // Stable refs so the interval closure always reads latest values without re-scheduling
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  // Last snapshot that was actually written to localStorage
  const snapshotRef = useRef(loadAutoSave() ?? { nodes: [], edges: [] });

  useEffect(() => {
    const timer = setInterval(() => {
      const currentNodes = nodesRef.current.map(cleanNode);
      const currentEdges = edgesRef.current;

      const diff = computeDiff(snapshotRef.current, currentNodes, currentEdges);

      const hasChanges =
        diff.addedNodes.length > 0 ||
        diff.removedNodes.length > 0 ||
        diff.modifiedNodes.length > 0 ||
        diff.addedEdges.length > 0 ||
        diff.removedEdges.length > 0;

      if (!hasChanges) return;

      const payload = {
        nodes: currentNodes,
        edges: currentEdges,
        currentId: nextIdRef.current,
        savedAt: Date.now(),
        lastDiff: diff,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.error("[useAutoSave] Failed to write snapshot:", e);
        return;
      }

      snapshotRef.current = { nodes: currentNodes, edges: currentEdges };

      pushToastGlobal(`Auto-saved · ${diffSummary(diff)}`, "success", 2000);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []); // empty deps — refs keep values fresh
}
