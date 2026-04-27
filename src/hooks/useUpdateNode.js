import { useCallback } from "react";

export default function useUpdateNode(setNodes) {
  const updateSingleNode = useCallback(
    (nodeId, updater) => {
      setNodes((nodes) =>
        nodes.map((node) => (node.id === nodeId ? updater(node) : node)),
      );
    },
    [setNodes],
  );

  return { updateSingleNode };
}
