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
  batchSize = 25,
  onComplete,
}) {
  const sourceNodeId = menuState?.nodeId;
  if (!sourceNodeId) return;

  let workingNodes = nodes;
  let workingEdges = edges;
  let created = 0;
  let finalSelectedNodeId = null;
  let aborted = false;

  const runBatch = () => {
    const batchLimit = Math.min(batchSize, totalToAdd - created);

    for (let i = 0; i < batchLimit; i++) {
      const sourceNode = workingNodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) {
        aborted = true;
        break;
      }

      const actionByOption = buildMenuActionMap({
        context: { sourceNode, sourceNodeId, allNodes: workingNodes },
        templates: MENU_NODE_TEMPLATES,
        getNextNodeId,
      });

      const buildPayload = actionByOption[optionId];
      if (!buildPayload) {
        aborted = true;
        break;
      }

      const payload = buildPayload();
      if (!payload) {
        aborted = true;
        break;
      }

      const directTargets = (payload.edgesToAdd || [])
        .filter((edge) => edge.source === sourceNodeId)
        .map((edge) => edge.target);

      const nextNodes = workingNodes.map((node) => {
        if (node.id !== sourceNodeId) return node;

        const existingOutPorts = node.data?.outPorts || [];
        const mergedOutPorts = Array.from(
          new Set([...existingOutPorts, ...directTargets]),
        );

        return {
          ...node,
          data: {
            ...node.data,
            outPorts: mergedOutPorts,
            connected: mergedOutPorts.length > 0,
          },
        };
      });

      workingNodes = [...nextNodes, ...(payload.nodesToAdd || [])];
      workingEdges = [...workingEdges, ...(payload.edgesToAdd || [])];
      finalSelectedNodeId = payload.selectedNodeId || finalSelectedNodeId;

      created++;
    }

    if (!aborted && created < totalToAdd) {
      requestAnimationFrame(runBatch);
      return;
    }

    onComplete({
      nodes: workingNodes,
      edges: workingEdges,
      selectedNodeId: finalSelectedNodeId,
    });
  };

  runBatch();
}
