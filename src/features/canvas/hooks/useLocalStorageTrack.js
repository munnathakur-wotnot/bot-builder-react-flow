import { useEffect } from "react";
import { getPersistedFlow } from "./useLocalStrorege";

export function useLocalStorageTrack(setNodes, setEdges, nextIdRef) {
  const { edges, nodes, currentId } = getPersistedFlow();

  const handlerStorageChanged = () => {
    setEdges(edges);
    setNodes(nodes);
    nextIdRef.current = currentId;
  };

  useEffect(() => {
    window.addEventListener("storage", handlerStorageChanged);

    return () => {
      window.removeEventListener("storage", handlerStorageChanged);
    };
  });
}
