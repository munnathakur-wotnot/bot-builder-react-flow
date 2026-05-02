import { useCallback } from "react";
import useUpdateNode from "./useUpdateNode";

/**
 * Shared hook â€” update a single node by id.
 */
export default function useNodeUpdater({ nodeId, setNodes }) {
  const { updateSingleNode } = useUpdateNode(setNodes);

  const updateNode = useCallback(
    (patch) => {
      updateSingleNode(nodeId, (node) => ({
        ...node,
        data: { ...node.data, ...patch },
      }));
    },
    [nodeId, updateSingleNode],
  );

  return { updateNode };
}
