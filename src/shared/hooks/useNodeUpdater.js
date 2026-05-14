import { useCallback } from "react";
import useUpdateNode from "./useUpdateNode";

/**
 * Shared hook â€” update a single node by id.
 */
export default function useNodeUpdater({ nodeId, setNodes }) {
  const { updateSingleNode } = useUpdateNode(setNodes);

  const updateNode = useCallback(
    (patch) => {
      updateSingleNode(nodeId, (node) => {
        const newData = { ...node.data, ...patch };
        if (patch.extras !== undefined) {
          newData.extras = {
            ...node.data.extras,
            ...patch.extras,
            ...(patch.extras.config !== undefined
              ? { config: { ...node.data.extras?.config, ...patch.extras.config } }
              : {}),
          };
        }
        return { ...node, data: newData };
      });
    },
    [nodeId, updateSingleNode],
  );

  return { updateNode };
}
