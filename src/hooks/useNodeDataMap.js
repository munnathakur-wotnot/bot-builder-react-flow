import { useCallback, useState } from "react";

const initialNodeDataMap = {
  node_1: {
    title: "Bot starts",
    description: "",
    type: "start",
  },
};

export default function useNodeDataMap() {
  const [nodeDataMap, setNodeDataMap] = useState(initialNodeDataMap);

  const updateNodeData = useCallback((nodeId, updater) => {
    setNodeDataMap((prev) => {
      const currentNodeData = prev[nodeId] ?? {};
      const nextNodeData =
        typeof updater === "function" ? updater(currentNodeData) : updater;

      return {
        ...prev,
        [nodeId]: {
          ...currentNodeData,
          ...nextNodeData,
        },
      };
    });
  }, []);

  const getNodeData = useCallback(
    (nodeId) => nodeDataMap[nodeId] ?? null,
    [nodeDataMap],
  );

  return {
    nodeDataMap,
    setNodeDataMap,
    updateNodeData,
    getNodeData,
  };
}
