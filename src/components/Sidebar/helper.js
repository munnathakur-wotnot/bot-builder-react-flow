import { addEdge } from "@xyflow/react";
import {
  buildAddCarouselCardPayload,
  removeNodeConnectionsForEdges,
} from "../Canvas/utils";

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
