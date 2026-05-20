import { MENU_NODE_TEMPLATES } from "../canvas/constants";
import { buildMenuActionMap } from "../canvas/newUtils";
import AiMenu from "./AiContextCard";
import ContextMenu from "./ContextMenu";
import { getMeStamp } from "../socket/useCursorStore.js";

export const menuRendering = (menu, props) => {
  return menu.type === "bottomLeft" && !menu.addAnother
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
  activeFlowId = null,
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
    activeFlowId,
  });

  const buildPayload = actionByOption[optionId];

  if (!buildPayload) return null;

  const payload = buildPayload();

  /*
   * Stamp authorship
   */
  const meStamp = getMeStamp();

  if (meStamp && payload.nodesToAdd?.length) {
    payload.nodesToAdd = payload.nodesToAdd.map((n) => ({
      ...n,
      data: {
        ...n.data,
        createdBy: meStamp,
        lastUpdatedBy: meStamp,
      },
    }));
  }

  /*
   * Direct targets
   */
  const directTargets = payload.edgesToAdd
    .filter((edge) => edge.source === sourceNode.id)
    .map((edge) => edge.target);

  /*
   * Update source node
   */
  const updatedNodes = nodes.map((node) => {
    if (node.id !== sourceNode.id) return node;

    let updatedData = {
      ...node.data,
    };

    /*
     * Legacy outport tracking
     */
    if (menuState.type === "bottomLeft") {
      const existing = node.data.successOutport || [];

      updatedData.successOutport = Array.from(
        new Set([...existing, ...directTargets]),
      );
    } else if (menuState.type === "bottomRight") {
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

    /*
     * NEW: update ports with edge ids
     */
    let updatedPorts = [...(node.data.ports || [])];

    payload.edgesToAdd.forEach((edge) => {
      if (edge.source !== node.id) return;

      const handleName = edge.sourceHandle || "bottom";

      const existingPortIndex = updatedPorts.findIndex(
        (p) => p.in === false && p.name === handleName,
      );

      if (existingPortIndex >= 0) {
        const existingPort = updatedPorts[existingPortIndex];

        updatedPorts[existingPortIndex] = {
          ...existingPort,
          links: Array.from(
            new Set([...(existingPort.links || []), edge.target]),
          ),
        };
      } else {
        updatedPorts.push({
          in: false,
          name: handleName,
          links: [edge.target],
        });
      }
    });

    return {
      ...node,
      data: {
        ...updatedData,
        ports: updatedPorts,
        connected: updatedPorts.some((p) => !p.in && (p.links?.length ?? 0) > 0),
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
  activeFlowId = null,
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
        context: {
          sourceNode,
          sourceNodeId,
          allNodes: workingNodes,
        },
        templates: MENU_NODE_TEMPLATES,
        getNextNodeId,
        sourceHandle: menuState.type,
        activeFlowId,
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

      /*
       * Direct targets
       */
      const directTargets = (payload.edgesToAdd || [])
        .filter((edge) => edge.source === sourceNodeId)
        .map((edge) => edge.target);

      /*
       * Update source node
       */
      const nextNodes = workingNodes.map((node) => {
        if (node.id !== sourceNodeId) return node;

        const updatedData = {
          ...node.data,
        };

        /*
         * Legacy outport tracking
         */
        if (menuState.type === "bottomLeft") {
          const existing = node.data.successOutport || [];

          updatedData.successOutport = Array.from(
            new Set([...existing, ...directTargets]),
          );
        } else if (menuState.type === "bottomRight") {
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

        /*
         * NEW: update ports
         */
        let updatedPorts = [...(node.data.ports || [])];

        (payload.edgesToAdd || []).forEach((edge) => {
          if (edge.source !== node.id) return;

          const handleName = edge.sourceHandle || "bottom";

          const existingPortIndex = updatedPorts.findIndex(
            (p) => p.in === false && p.name === handleName,
          );

          if (existingPortIndex >= 0) {
            const existingPort = updatedPorts[existingPortIndex];

            updatedPorts[existingPortIndex] = {
              ...existingPort,
              links: Array.from(
                new Set([...(existingPort.links || []), edge.target]),
              ),
            };
          } else {
            updatedPorts.push({
              in: false,
              name: handleName,
              links: [edge.target],
            });
          }
        });

        return {
          ...node,
          data: {
            ...updatedData,
            ports: updatedPorts,
            connected: updatedPorts.some((p) => !p.in && (p.links?.length ?? 0) > 0),
          },
        };
      });

      /*
       * Shift created nodes
       */
      const NODE_STRIDE = 320;

      const xOffset = created * NODE_STRIDE;

      const shiftedNodes = (payload.nodesToAdd || []).map((n) => ({
        ...n,
        position: {
          x: n.position.x + xOffset,
          y: n.position.y,
        },
      }));

      workingNodes = [...nextNodes, ...shiftedNodes];

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
