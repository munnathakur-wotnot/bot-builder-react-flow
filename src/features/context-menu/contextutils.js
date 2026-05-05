import { MENU_NODE_TEMPLATES } from "../canvas/constants";
import { buildMenuActionMap } from "../canvas/utils";
import AiMenu from "./AiContextCard";
import ContextMenu from "./ContextMenu";

export const menuRendering = (menu, props) => {
  return menu.type === "success" && !menu.addAnother
    ? { compoent: AiMenu, props: { ...props } }
    : { compoent: ContextMenu, props: { ...props } };
};

export function calculateMenuHeight(y, options = {}) {
  const { maxHeight = 440, minHeight = 200, viewportPadding = 12 } = options;

  const availableHeight = window.innerHeight - y - viewportPadding;

  const menuHeight = Math.min(maxHeight, Math.max(availableHeight, minHeight));

  return {
    availableHeight,
    menuHeight,
  };
}

export function filterMenuCategories(menuCategories, searchQuery) {
  const lowerQuery = searchQuery?.toLowerCase().trim();

  const filteredCategories = menuCategories
    .map((cat) => ({
      ...cat,
      options: cat.options.filter(
        (opt) => !lowerQuery || opt.label.toLowerCase().includes(lowerQuery),
      ),
    }))
    .filter((cat) => cat.options.length > 0);

  return filteredCategories;
}

export function getMenuSelectionPayload({
  optionId,
  menuState,
  nodes,
  getNextNodeId,
}) {
  if (!menuState?.nodeId) return null;

  const sourceNode = nodes.find((n) => n.id === menuState.nodeId);
  if (!sourceNode) return null;

  const actionByOption = buildMenuActionMap({
    context: {
      sourceNode,
      sourceNodeId: menuState.nodeId,
      allNodes: nodes,
    },
    templates: MENU_NODE_TEMPLATES,
    getNextNodeId,
    sourceHandle: menuState.type,
  });

  const buildPayload = actionByOption[optionId];
  if (!buildPayload) return null;

  const payload = buildPayload();

  const directTargets = payload.edgesToAdd
    .filter((edge) => edge.source === sourceNode.id)
    .map((edge) => edge.target);

  const updatedNodes = nodes.map((node) => {
    if (node.id !== sourceNode.id) return node;

    let updatedData = { ...node.data };

    if (menuState.type === "success") {
      const existing = node.data.successOutport || [];
      updatedData.successOutport = Array.from(
        new Set([...existing, ...directTargets]),
      );
    } else if (menuState.type === "failure") {
      const existing = node.data.failureOutport || [];
      updatedData.failureOutport = Array.from(
        new Set([...existing, ...directTargets]),
      );
    } else {
      const existing = node.data.outPorts || [];
      updatedData.outPorts = Array.from(
        new Set([...existing, ...directTargets]),
      );
    }

    return {
      ...node,
      data: {
        ...updatedData,
        connected:
          (updatedData.outPorts?.length || 0) > 0 ||
          (updatedData.successOutport?.length || 0) > 0 ||
          (updatedData.failureOutport?.length || 0) > 0,
      },
    };
  });

  return {
    nodes: [...updatedNodes, ...payload.nodesToAdd],
    edges: payload.edgesToAdd,
    selectedNodeId: payload.selectedNodeId,
  };
}

// bulk CreateFromSource
export function bulkCreateFromSource({
  optionId,
  menuState,
  nodes,
  edges,
  totalToAdd,
  getNextNodeId,
  onComplete,
}) {
  const sourceNodeId = menuState?.nodeId;
  if (!sourceNodeId) return;

  const sourceNode = nodes.find((n) => n.id === sourceNodeId);
  if (!sourceNode) return;

  // Build the payload factory ONCE against the original snapshot.
  // The original code rebuilt it on every iteration → O(n²) allNodes.filter()
  // calls inside getIncrementalTitle alone. Passing allNodes:[] skips the
  // title-numbering filter; bulk nodes share a base title which is acceptable.
  const actionByOption = buildMenuActionMap({
    context: { sourceNode, sourceNodeId, allNodes: [] },
    templates: MENU_NODE_TEMPLATES,
    getNextNodeId,
    sourceHandle: menuState.type,
  });
  const buildPayload = actionByOption[optionId];
  if (!buildPayload) return;

  // Pre-allocate output arrays — no per-iteration array spreading (was O(n²)).
  const newNodes = [];
  const newEdges = [];
  const directTargets = [];
  let finalSelectedNodeId = null;

  for (let i = 0; i < totalToAdd; i++) {
    const payload = buildPayload();
    if (!payload) break;

    // Spread Y positions so onlyRenderVisibleElements can cull off-screen
    // nodes. Without this, all 1000 nodes land at the same coordinate and
    // React Flow treats every one as "visible" every frame.
    const spreadNodes = (payload.nodesToAdd || []).map((n) => ({
      ...n,
      position: { x: n.position.x, y: n.position.y + i * 220 },
    }));

    newNodes.push(...spreadNodes);
    newEdges.push(...(payload.edgesToAdd || []));

    for (const edge of payload.edgesToAdd || []) {
      if (edge.source === sourceNodeId) directTargets.push(edge.target);
    }

    finalSelectedNodeId = payload.selectedNodeId || finalSelectedNodeId;
  }

  // Update source node's outPorts ONCE at the end — not on every iteration.
  const updatedNodes = nodes.map((node) => {
    if (node.id !== sourceNodeId) return node;
    const existing = node.data?.outPorts || [];
    const merged = Array.from(new Set([...existing, ...directTargets]));
    return {
      ...node,
      data: { ...node.data, outPorts: merged, connected: merged.length > 0 },
    };
  });

  onComplete({
    nodes: [...updatedNodes, ...newNodes],
    edges: [...edges, ...newEdges],
    selectedNodeId: finalSelectedNodeId,
  });
}
