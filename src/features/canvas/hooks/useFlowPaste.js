import { useEffect } from "react";

export function useFlowPaste({
  setNodes,
  setEdges,
  getNextNodeId,
  fitView,
  screenToFlowPosition,
  getCursorFlowPosition,
}) {
  useEffect(() => {
    const handlePaste = (e) => {
      const activeElement = document.activeElement;

      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.isContentEditable
      ) {
        return;
      }

      try {
        const text = e.clipboardData.getData("text");
        if (!text) return;

        const parsed = JSON.parse(text);

        let copiedNodes = [];
        let copiedEdges = [];

        if (parsed?.type === "flow/nodes") {
          copiedNodes = parsed.nodes || [];
          copiedEdges = parsed.edges || [];
        } else if (Array.isArray(parsed)) {
          copiedNodes = parsed;
        } else if (parsed?.type && parsed?.data) {
          copiedNodes = [parsed];
        } else {
          return;
        }

        const basePos = getCursorFlowPosition?.() || {
          x: 100,
          y: 100,
        };

        const offset = 40;
        const idMap = {};

        const newNodes = copiedNodes.map((node, index) => {
          const oldId = node.id || node.data?.id;
          const newId = getNextNodeId();

          idMap[oldId] = newId;

          return {
            ...node,
            id: newId,
            position: {
              x: basePos.x + index * offset,
              y: basePos.y + index * offset,
            },
            data: {
              ...node.data,
              id: newId,
              isSearchHighlight: false,
              isErrorShow: false,
            },
            selected: false,
          };
        });

        const newEdges = (copiedEdges || [])
          .filter((e) => idMap[e.source] && idMap[e.target])
          .map((e) => ({
            ...e,
            id: `edge_${crypto.randomUUID()}`,
            source: idMap[e.source],
            target: idMap[e.target],
            selected: false,
          }));

        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => [...eds, ...newEdges]);

        requestAnimationFrame(() => {
          fitView({ duration: 300, padding: 0.2 });
        });
      } catch {
        // ignore invalid JSON
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [
    setNodes,
    setEdges,
    getNextNodeId,
    fitView,
    screenToFlowPosition,
    getCursorFlowPosition,
  ]);
}
