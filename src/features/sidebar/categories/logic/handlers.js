import { handleAddBranch } from "./helper";
import { handleRemoveBranch } from "../../helper";

export function getLogicHandlers({
  updateNode,
  selectedNode,
  nodes,
  edges,
  getNextNodeId,
  setNodes,
  setEdges,
  nodeData,
}) {
  const updateBranchData = (branchId, patch) =>
    setNodes((nds) =>
      nds.map((n) =>
        n.id === branchId ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    );

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
      reorderBranches: (reorderedChildren) => {
        // Preserve "other" (default/else) children at the end
        const otherChildren = (nodeData?.children ?? []).filter(
          (c) => c.type === "other",
        );
        const allChildren = [...reorderedChildren, ...otherChildren];
        updateNode({
          children: allChildren,
          outPorts: allChildren
            .filter((c) => c.type !== "other")
            .map((c) => (typeof c === "string" ? c : c.id)),
        });
      },
      removeBranch: (branchId) =>
        handleRemoveBranch({
          selectedNode,
          nodes,
          edges,
          branchId,
          setNodes,
          setEdges,
          updateNode,
        }),
      updateBranchConditions: (branchId, conditions) =>
        updateBranchData(branchId, { conditions }),
      updateBranchConditionType: (branchId, conditionType) =>
        updateBranchData(branchId, { conditionType }),
    },
  };
}
