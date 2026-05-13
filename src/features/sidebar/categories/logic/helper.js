import { addEdge } from "@xyflow/react";
import { buildSingleBranch } from "../../../canvas/newUtils";

export function handleAddBranch({
  selectedNode,
  nodes,
  edges,
  getNextNodeId,
  setNodes,
  setEdges,
  updateNode,
}) {
  if (!selectedNode) return;

  const payload = buildSingleBranch({
    selectedNodeId: selectedNode.id,
    conditionNode: selectedNode,
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
