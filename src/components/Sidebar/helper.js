import { addEdge } from "@xyflow/react";
import { buildAddCarouselCardPayload } from "../Canvas/utils";
import { buildLaidOutGraph } from "../Canvas/layout";

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
    getNextNodeId,
  });

  const patch = payload.dataPatch?.[selectedNode.id];
  const nextNodes = nodes.map((node) => {
    if (node.id !== selectedNode.id) return node;

    return {
      ...node,
      position: payload.positionPatch?.[node.id]?.position ?? node.position,
      data: {
        ...node.data,
        ...patch,
      },
    };
  });
  const mergedNodes = nextNodes.map((node) => ({
    ...node,
    position: payload.positionPatch?.[node.id]?.position ?? node.position,
  }));
  const graphNodes = [...mergedNodes, ...payload.nodesToAdd];
  const graphEdges = payload.edgesToAdd.reduce(
    (acc, edge) => addEdge(edge, acc),
    edges,
  );
  const { nodes: laidOutNodes } = buildLaidOutGraph(graphNodes, graphEdges);

  setNodes(laidOutNodes);
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
