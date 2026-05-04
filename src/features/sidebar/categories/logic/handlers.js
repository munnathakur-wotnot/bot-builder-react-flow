import { handleAddBranch } from "./helper";

export function getLogicHandlers({
  updateNode,
  selectedNode,
  nodes,
  edges,
  getNextNodeId,
  setNodes,
  setEdges,
}) {
  return {
    delay: {
      setDuration: (value) => updateNode({ delayDuration: value }),
    },
    conditionRoot: {
      addConditionCard: () =>
        handleAddBranch({
          selectedNode,
          nodes,
          edges,
          getNextNodeId,
          setNodes,
          setEdges,
          updateNode,
        }),
    },
  };
}
