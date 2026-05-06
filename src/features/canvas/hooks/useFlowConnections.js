import { useCallback, useRef } from "react";
import { addEdge } from "@xyflow/react";
import {
  applyConnectionToNodes,
  isConnectionAllowed,
  removeNodeConnectionsForEdges,
} from "../utils";

/**
 * Encapsulates all edge/connection logic for the canvas:
 *   - onConnect        called by ReactFlow when a valid handle-to-handle drag completes
 *   - handleConnectEnd called when a drag-connect ends anywhere (including on a node body)
 *   - handleConnectStart / handleConnectEnd  control the "connecting" CSS class
 *   - handleDeleteEdge  delete a single edge by id
 *   - handleEdgesDelete called by ReactFlow's built-in edge deletion
 */
export function useFlowConnections({
  edges,
  setEdges,
  setNodes,
  nodesRef,
  flowWrapperRef,
}) {
  // Stable ref so callbacks don't need edges in their dep arrays
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const handleConnectStart = useCallback(() => {
    flowWrapperRef.current?.classList.add("flow-connecting");
  }, [flowWrapperRef]);

  const onConnect = useCallback(
    (params) => {
      if (
        !isConnectionAllowed(
          edgesRef.current,
          params.source,
          params.sourceHandle,
        )
      )
        return;

      if (params.source === params.target) {
        params.hidden = true;
      }
      setEdges((eds) => addEdge({ ...params, type: "custom" }, eds));
      setNodes((nds) => applyConnectionToNodes(nds, params));
    },
    [setEdges, setNodes],
  );

  const handleConnectEnd = useCallback(
    (event, connectionState) => {
      flowWrapperRef.current?.classList.remove("flow-connecting");

      if (connectionState?.isValid) return;

      const sourceNodeId = connectionState?.fromNode?.id;
      if (!sourceNodeId) return;

      const targetEl = event.target?.closest?.("[data-id]");
      const targetNodeId = targetEl?.getAttribute?.("data-id");
      if (!targetNodeId || targetNodeId === sourceNodeId) return;

      const targetNode = nodesRef.current.find((n) => n.id === targetNodeId);
      if (
        !targetNode ||
        targetNode.data?.type === "start" ||
        !targetNode.data?.isValidDragConn
      )
        return;

      onConnect({
        source: sourceNodeId,
        target: targetNodeId,
        sourceHandle: connectionState.fromHandle?.id,
      });
    },
    [onConnect, nodesRef, flowWrapperRef],
  );

  const handleDeleteEdge = useCallback(
    (edgeId, sourceId, targetId, sourceHandleId) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      setNodes((nds) =>
        removeNodeConnectionsForEdges(nds, [
          {
            id: edgeId,
            source: sourceId,
            target: targetId,
            sourceHandle: sourceHandleId,
          },
        ]),
      );
    },
    [setEdges, setNodes],
  );

  const handleEdgesDelete = useCallback(
    (deletedEdges) => {
      setNodes((nds) => removeNodeConnectionsForEdges(nds, deletedEdges));
    },
    [setNodes],
  );

  return {
    handleConnectStart,
    onConnect,
    handleConnectEnd,
    handleDeleteEdge,
    handleEdgesDelete,
  };
}
