import { addEdge } from "@xyflow/react";
import { buildAddCarouselCardPayload } from "../Canvas/utils";

export function handleAddCarousel({
  selectedNode,
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

  // Batch-like updates
  setNodes((curr) => [...curr, ...payload.nodesToAdd]);

  setEdges((eds) =>
    payload.edgesToAdd.reduce((acc, edge) => addEdge(edge, acc), eds),
  );

  // Patch carousel data
  const patch = payload.dataPatch?.[selectedNode.id];
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
