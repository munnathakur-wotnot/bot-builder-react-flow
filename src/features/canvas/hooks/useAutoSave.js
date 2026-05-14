import { useEffect, useRef } from "react";
import { EPHEMERAL_NODE_KEYS } from "../constants.js";
import { pushToastGlobal } from "../../../shared/ui/feedback/Toast.jsx";
import { migrateToReactFlow, migrateFromReactFlow } from "../orliginalMigrate";

const STORAGE_KEY = "flow_autosave";
const INTERVAL_MS = 5000;

// Fields compared to detect node modifications
// const TRACKED_NODE_FIELDS = ["title", "description", "position"];

/** Strip ephemeral collab fields so they're never persisted */
function cleanNode(node) {
  const data = { ...node.data };
  EPHEMERAL_NODE_KEYS.forEach((k) => delete data[k]);
  return { ...node, data };
}

/** Shallow-compare tracked fields of two nodes */
function nodeChanged(prev, next) {
  if (
    prev.data.extras?.config?.title !== next.data.extras?.config?.title ||
    prev.data.extras?.config?.description !== next.data.extras?.config?.description
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

  const addedEdges = edges
    .filter((e) => !prevEdgeIds.has(e.id))
    .map((e) => e.id);
  const currentEdgeIds = new Set(edges.map((e) => e.id));
  const removedEdges = [...prevEdgeIds].filter((id) => !currentEdgeIds.has(id));

  return { addedNodes, modifiedNodes, removedNodes, addedEdges, removedEdges };
}

/** Build a human-readable summary string from a diff */
function diffSummary(diff) {
  const parts = [];
  if (diff.addedNodes.length)
    parts.push(
      `+${diff.addedNodes.length} node${diff.addedNodes.length > 1 ? "s" : ""}`,
    );
  if (diff.removedNodes.length)
    parts.push(
      `-${diff.removedNodes.length} node${diff.removedNodes.length > 1 ? "s" : ""}`,
    );
  if (diff.modifiedNodes.length)
    parts.push(`~${diff.modifiedNodes.length} modified`);
  if (diff.addedEdges.length)
    parts.push(
      `+${diff.addedEdges.length} edge${diff.addedEdges.length > 1 ? "s" : ""}`,
    );
  if (diff.removedEdges.length)
    parts.push(
      `-${diff.removedEdges.length} edge${diff.removedEdges.length > 1 ? "s" : ""}`,
    );
  return parts.join(", ");
}

/** Load the last saved snapshot from localStorage */
export function loadAutoSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);

    // New autosave format: old-flow JSON (has links array)
    if (Array.isArray(data.links)) {
      const rf = migrateToReactFlow(data);
      return {
        nodes: rf.nodes,
        edges: rf.edges,
        currentId: data._autosave?.currentId,
        savedAt: data._autosave?.savedAt,
      };
    }

    // Legacy RF format autosave
    return data;
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
export function useAutoSave({ nodes, edges, nextIdRef, flowMetaRef, getViewport }) {
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

      // Build old-format payload via migrateFromReactFlow so autosave and
      // export always store the same JSON structure (same keys, version, etc.)
      const viewport = getViewport?.() ?? { x: 0, y: 0, zoom: 1 };
      const rfFlow = {
        ...flowMetaRef?.current,
        nodes: currentNodes,
        edges: currentEdges,
        viewport,
      };

      // ── timed: migration ────────────────────────────────────
      const t0migrate = performance.now();
      const payload = migrateFromReactFlow(rfFlow);
      const t1migrate = performance.now();

      // ── timed: JSON serialise ────────────────────────────────
      const t0serial = performance.now();
      // Embed autosave-specific metadata so loadAutoSave can restore currentId
      payload._autosave = {
        currentId: nextIdRef.current,
        savedAt: Date.now(),
        lastDiff: diff,
      };
      const jsonString = JSON.stringify(payload);
      const t1serial = performance.now();

      console.log(
        `[AutoSave] migrateFromReactFlow: ${(t1migrate - t0migrate).toFixed(2)}ms` +
        ` | JSON.stringify: ${(t1serial - t0serial).toFixed(2)}ms` +
        ` | Total: ${(t1serial - t0migrate).toFixed(2)}ms` +
        ` | nodes=${currentNodes.length} edges=${currentEdges.length}`,
      );

      try {
        localStorage.setItem(STORAGE_KEY, jsonString);
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
