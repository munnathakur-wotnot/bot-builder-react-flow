import { useCallback, useEffect, useMemo, useState } from "react";
import { useReactFlow } from "@xyflow/react";

/**
 * Manages the active sub-flow scope:
 *  - activeFlowId state (null = main canvas)
 *  - visibleNodes / visibleEdges filtered by top-level flowId
 *  - flowOptions derived from "flow"-type nodes
 *  - handleEnterFlow to navigate into a sub-flow
 *  - fitView side-effect on scope change
 */
export function useFlowScope({ nodes, edges, setSelectedNodeIdUpdate }) {
  const [activeFlowId, setActiveFlowId] = useState(null);
  const { fitView } = useReactFlow();

  // Only nodes/edges belonging to the current scope
  const visibleNodes = useMemo(
    () => nodes.filter((n) => (n.flowId ?? null) === activeFlowId),
    [nodes, activeFlowId],
  );

  const visibleEdges = useMemo(
    () => edges.filter((e) => (e.flowId ?? null) === activeFlowId),
    [edges, activeFlowId],
  );

  // Dropdown options — one entry per "flow" node on ANY canvas
  const flowOptions = useMemo(
    () =>
      nodes
        .filter((n) => n.data.type === "flow" && n.data.targetFlowId)
        .map((n) => ({
          id: n.data.targetFlowId,
          label: n.data.title || "Unnamed Flow",
        })),
    [nodes],
  );

  // Human-readable label for the active scope
  const activeFlowLabel = useMemo(() => {
    if (!activeFlowId) return null;
    return flowOptions.find((f) => f.id === activeFlowId)?.label ?? "Flow";
  }, [activeFlowId, flowOptions]);

  // Re-fit whenever scope changes
  useEffect(() => {
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 400 });
    });
  }, [activeFlowId, fitView]);

  const handleEnterFlow = useCallback(
    (targetFlowId) => {
      if (!targetFlowId) return;
      setSelectedNodeIdUpdate();
      setActiveFlowId(targetFlowId);
    },
    [setSelectedNodeIdUpdate],
  );

  const handleGoHome = useCallback(() => {
    setSelectedNodeIdUpdate();
    setActiveFlowId(null);
  }, [setSelectedNodeIdUpdate]);

  const handleSelectFlow = useCallback(
    (flowId) => {
      setSelectedNodeIdUpdate();
      setActiveFlowId(flowId || null);
    },
    [setSelectedNodeIdUpdate],
  );

  return {
    activeFlowId,
    visibleNodes,
    visibleEdges,
    flowOptions,
    activeFlowLabel,
    handleEnterFlow,
    handleGoHome,
    handleSelectFlow,
  };
}
