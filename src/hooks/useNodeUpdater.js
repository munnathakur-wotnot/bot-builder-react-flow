import { useCallback } from "react";
import useUpdateNode from "./useUpdateNode";

/**
 * Shared hook — one updateNode(patch) call keeps both the flow
 * node (via setNodes) and the sidebar's selectedNode state in sync.
 */
export default function useNodeUpdater({ nodeId, setNodes, setSelectedNode }) {
  const { updateSingleNode } = useUpdateNode(setNodes);

  const updateNode = useCallback(
    (patch) => {
      updateSingleNode(nodeId, (node) => ({
        ...node,
        data: { ...node.data, ...patch },
      }));
      setSelectedNode((prev) => ({
        ...prev,
        data: { ...prev.data, ...patch },
      }));
    },
    [nodeId, updateSingleNode, setSelectedNode],
  );

  return { updateNode };
}
