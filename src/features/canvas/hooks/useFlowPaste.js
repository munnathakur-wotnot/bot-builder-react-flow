import { useEffect } from "react";
import { pushToastGlobal } from "../../../shared/ui/feedback/Toast.jsx";

export function useFlowPaste({
  setNodes,
  setEdges,
  getNextNodeId,
  fitView,
  screenToFlowPosition,
  getCursorFlowPosition,
  activeFlowId = null,
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

      const text = e.clipboardData?.getData("text");
      if (!text) return;

      // ── Parse ──────────────────────────────────────────────────
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        pushToastGlobal("Invalid JSON — nothing to paste.", "error");
        return;
      }

      // ── Validate shape ─────────────────────────────────────────
      let copiedNodes = [];
      let copiedEdges = [];

      if (parsed?.type === "flow/nodes") {
        copiedNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
        copiedEdges = Array.isArray(parsed.edges) ? parsed.edges : [];
      } else if (Array.isArray(parsed)) {
        copiedNodes = parsed;
      } else if (parsed?.type && parsed?.data) {
        copiedNodes = [parsed];
      } else {
        pushToastGlobal("Clipboard doesn't contain valid flow data.", "error");
        return;
      }

      if (copiedNodes.length === 0) {
        pushToastGlobal("Nothing to paste.", "error");
        return;
      }

      // ── Remap IDs & position ───────────────────────────────────
      const basePos = getCursorFlowPosition?.() ?? { x: 100, y: 100 };
      const OFFSET_STEP = 40;

      // Compute bounding-box top-left of copied nodes to keep relative layout
      const minX = Math.min(...copiedNodes.map((n) => n.position?.x ?? 0));
      const minY = Math.min(...copiedNodes.map((n) => n.position?.y ?? 0));

      const idMap = {};

      const newNodes = copiedNodes.map((node) => {
        const oldId = node.id ?? node.data?.id;
        const newId = getNextNodeId();
        idMap[oldId] = newId;

        return {
          ...node,
          id: newId,
          flowId: activeFlowId,          // stamp with current scope
          position: {
            x: basePos.x + (node.position?.x ?? 0) - minX + OFFSET_STEP,
            y: basePos.y + (node.position?.y ?? 0) - minY + OFFSET_STEP,
          },
          data: {
            ...node.data,
            id: newId,
            // remap groupId if it belonged to a copied carousel parent
            groupId: node.data?.groupId
              ? (idMap[node.data.groupId] ?? node.data.groupId)
              : undefined,
            isSearchHighlight: false,
            isErrorShow: false,
          },
          selected: false,
        };
      });

      // Fix groupId for sub-nodes whose parent was remapped in the same paste
      // (idMap is now fully populated)
      newNodes.forEach((n) => {
        if (n.data?.groupId && idMap[n.data.groupId]) {
          n.data = { ...n.data, groupId: idMap[n.data.groupId] };
        }
      });

      // Remap edges — only keep edges whose both ends exist in the pasted set
      const newEdges = copiedEdges
        .filter((edge) => idMap[edge.source] && idMap[edge.target])
        .map((edge) => ({
          ...edge,
          id: `edge_${crypto.randomUUID()}`,
          source: idMap[edge.source],
          target: idMap[edge.target],
          flowId: activeFlowId,
          data: { ...(edge.data ?? {}), isNotDeletable: false },
          selected: false,
        }));

      setNodes((nds) => [...nds, ...newNodes]);
      setEdges((eds) => [...eds, ...newEdges]);

      const nodeCount = newNodes.length;
      const edgeCount = newEdges.length;
      pushToastGlobal(
        `Pasted ${nodeCount} node${nodeCount !== 1 ? "s" : ""}${edgeCount > 0 ? ` and ${edgeCount} edge${edgeCount !== 1 ? "s" : ""}` : ""}.`,
        "success",
      );

      requestAnimationFrame(() => {
        fitView?.({ duration: 300, padding: 0.2 });
      });
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
    activeFlowId,
  ]);
}

