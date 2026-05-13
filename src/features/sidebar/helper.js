import { addEdge } from "@xyflow/react";
import {
  buildAddCarouselCardPayload,
  removeNodeConnectionsForEdges,
} from "../canvas/newUtils";
import DurationSelector from "./categories/logic/DurationSelector";
import NodeSidebar from "./NodeSidebar";

export function handleAddCarousel({
  selectedNode,
  nodes,
  edges,
  getNextNodeId,
  setNodes,
  setEdges,
  updateNode,
}) {
  if (!selectedNode) return;

  const payload = buildAddCarouselCardPayload({
    selectedNodeId: selectedNode.id,
    carouselNode: selectedNode,
    allNodes: nodes,
    getNextNodeId,
  });

  const patch = payload.dataPatch?.[selectedNode.id];
  const nextNodes = nodes.map((node) => {
    if (node.id !== selectedNode.id) return node;

    return {
      ...node,
      data: {
        ...node.data,
        ...patch,
      },
    };
  });
  const graphNodes = [...nextNodes, ...payload.nodesToAdd];
  const graphEdges = payload.edgesToAdd.reduce(
    (acc, edge) => addEdge(edge, acc),
    edges,
  );
  setNodes(graphNodes);
  setEdges(graphEdges);

  if (patch) updateNode(patch);
}

export function handleAddForm({ nodeData, updateNode }) {
  const fields = nodeData?.fields ?? [];

  updateNode({
    fields: [
      ...fields,
      {
        id: `field_${Date.now()}`,
        label: "New Field",
        type: "text",
      },
    ],
  });
}

export function handleRemoveBranch({
  selectedNode,
  nodes,
  edges,
  branchId,
  setNodes,
  setEdges,
  updateNode,
}) {
  if (!selectedNode || !branchId) return;

  const idsToRemove = new Set([branchId]);

  const removedEdges = edges.filter(
    (edge) => idsToRemove.has(edge.source) || idsToRemove.has(edge.target),
  );

  const remainingEdges = edges.filter(
    (edge) => !idsToRemove.has(edge.source) && !idsToRemove.has(edge.target),
  );

  const remainingNodes = nodes.filter((node) => !idsToRemove.has(node.id));
  const cleanedNodes = removeNodeConnectionsForEdges(
    remainingNodes,
    removedEdges,
  );

  const nextChildren = (selectedNode.data?.children ?? []).filter((child) => {
    if (typeof child === "string") return child !== branchId;
    return child.id !== branchId;
  });

  const nextNodes = cleanedNodes.map((node) => {
    if (node.id !== selectedNode.id) return node;
    return {
      ...node,
      data: {
        ...node.data,
        children: nextChildren,
        outPorts: nextChildren
          .filter((c) => c.type !== "other")
          .map((c) => (typeof c === "string" ? c : c.id)),
      },
    };
  });

  setNodes(nextNodes);
  setEdges(remainingEdges);
  updateNode({
    children: nextChildren,
    outPorts: nextChildren
      .filter((c) => c.type !== "other")
      .map((c) => (typeof c === "string" ? c : c.id)),
  });
}

export function handleRemoveCarouselCard({
  selectedNode,
  nodes,
  edges,
  cardId,
  setNodes,
  setEdges,
  updateNode,
}) {
  if (!selectedNode || !cardId) return;

  const cardNode = nodes.find((node) => node.id === cardId);
  const buttonIds = cardNode?.data?.outPorts ?? [];
  const idsToRemove = new Set([cardId, ...buttonIds]);

  const removedEdges = edges.filter(
    (edge) => idsToRemove.has(edge.source) || idsToRemove.has(edge.target),
  );

  const remainingEdges = edges.filter(
    (edge) => !idsToRemove.has(edge.source) && !idsToRemove.has(edge.target),
  );

  const remainingNodes = nodes.filter((node) => !idsToRemove.has(node.id));
  const cleanedNodes = removeNodeConnectionsForEdges(
    remainingNodes,
    removedEdges,
  );

  const nextCards = (selectedNode.data?.cards ?? []).filter((card) => {
    if (typeof card === "string") return card !== cardId;
    return card.id !== cardId;
  });

  const nextNodes = cleanedNodes.map((node) => {
    if (node.id !== selectedNode.id) return node;

    return {
      ...node,
      data: {
        ...node.data,
        cards: nextCards,
        outPorts: nextCards.map((card) =>
          typeof card === "string" ? card : card.id,
        ),
        connected: nextCards.length > 0 || (node.data.inPorts?.length ?? 0) > 0,
      },
    };
  });

  setNodes(nextNodes);
  setEdges(remainingEdges);
  updateNode({ cards: nextCards });
}

export const RENDER_MAPPING = {
  delay: DurationSelector,
  default: NodeSidebar,
};
export const renderSidebarMapping = (type) =>
  type === "delay" ? "delay" : "default";
