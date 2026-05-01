import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./Canvas.css";
import CustomNode from "../Nodes/CustomNode";
import { INITIAL_EDGES, INITIAL_NODES } from "./constants";
import CustomEdge from "../Edges/CustumEdges";
import { FlowCallbacksProvider } from "./FlowCallbacksContext.jsx";
import HeaderTooltip from "../headerTooltip/HeaderTooltip.jsx";
import { removeNodeConnectionsForEdges } from "./utils.js";
import SidebarIndex from "../Sidebar/index.jsx";
import ConextMenuIndex from "../Menu/index.jsx";

const nodeTypes = { custom: CustomNode };
const edgeTypes = {
  custom: CustomEdge,
};

const StaticBackground = React.memo(function StaticBackground() {
  return <Background gap={20} size={1} />;
});

const StaticControls = React.memo(function StaticControls() {
  return <Controls />;
});

export default function CanvasFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [nuberOfNodes, setNumberOfNodes] = useState(0);
  const [menuState, setMenuState] = useState(null);
  const nextIdRef = useRef(2);
  const flowWrapperRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  // Records each group member's position at the start of a drag
  const dragStartRef = useRef({});

  const handleConnectStart = useCallback(() => {
    flowWrapperRef.current?.classList.add("flow-connecting");
  }, []);

  // ── Group drag ──────────────────────────────────────────────────────────
  // Resolves the groupId for a node:
  //   carousel node  → its own id (it IS the group root)
  //   card / button  → data.groupId (set at creation time)
  const getGroupId = useCallback(
    (node) => (node.data?.type === "carousel" ? node.id : null),
    [],
  );

  const onGroupNodeDragStart = useCallback(
    (_, node) => {
      const groupId = getGroupId(node);
      if (!groupId) return;
      // Snapshot absolute positions of every group member
      const snapshot = {};
      nodesRef.current.forEach((n) => {
        if (n.id === groupId || n.data?.groupId === groupId) {
          snapshot[n.id] = { x: n.position.x, y: n.position.y };
        }
      });
      dragStartRef.current = snapshot;
    },
    [getGroupId],
  );

  const onGroupNodeDrag = useCallback(
    (_, node) => {
      const groupId = getGroupId(node);
      if (!groupId) return;
      const startPos = dragStartRef.current[node.id];
      if (!startPos) return;
      const dx = node.position.x - startPos.x;
      const dy = node.position.y - startPos.y;
      if (dx === 0 && dy === 0) return;
      setNodes((nds) =>
        nds.map((n) => {
          // The drag system owns the actively dragged node — skip it.
          if (n.id === node.id) return n;
          // Only co-move nodes that belong to the same group.
          if (n.id !== groupId && n.data?.groupId !== groupId) return n;
          const nStart = dragStartRef.current[n.id];
          if (!nStart) return n;
          return {
            ...n,
            position: { x: nStart.x + dx, y: nStart.y + dy },
          };
        }),
      );
    },
    [getGroupId, setNodes],
  );
  // ────────────────────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params) => {
      // Allow only one outgoing connection per source node
      const alreadyConnected = edges.some(
        (e) =>
          e.source === params.source && e.sourceHandle === params.sourceHandle,
      );

      if (alreadyConnected) return;

      setEdges((eds) => addEdge({ ...params, type: "custom" }, eds));
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === params.source) {
            let updatedData = { ...node.data };

            if (params.sourceHandle === "success") {
              updatedData.successOutport = [
                ...(node.data.successOutport || []),
                params.target,
              ];
            } else if (params.sourceHandle === "failure") {
              updatedData.failureOutport = [
                ...(node.data.failureOutport || []),
                params.target,
              ];
            } else {
              updatedData.outPorts = [
                ...(node.data.outPorts || []),
                params.target,
              ];
            }

            return {
              ...node,
              data: {
                ...updatedData,
                connected: true,
              },
            };
          }
          if (node.id === params.target) {
            const newInPorts = [...(node.data.inPorts || []), params.source];
            return {
              ...node,
              data: {
                ...node.data,
                inPorts: newInPorts,
                connected: true,
              },
            };
          }
          return node;
        }),
      );
    },
    [edges, setNodes, setEdges],
  );

  const handleConnectEnd = useCallback(
    (event, connectionState) => {
      flowWrapperRef.current?.classList.remove("flow-connecting");

      // Already landed on a valid handle — React Flow handles it
      if (connectionState?.isValid) return;

      const sourceNodeId = connectionState?.fromNode?.id;
      if (!sourceNodeId) return;

      // Find which node the cursor is over
      const targetEl = event.target?.closest?.("[data-id]");
      const targetNodeId = targetEl?.getAttribute?.("data-id");
      if (!targetNodeId || targetNodeId === sourceNodeId) return;

      // Don't connect to start nodes or Custom nodes should not be allowed to connect with other nodes.
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
    [onConnect],
  );

  const openMenu = useCallback(
    ({ nodeId, x, y, type, isSelfLoop }) => {
      setMenuState({ nodeId, x, y, type, isSelfLoop });
    },
    [setMenuState],
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

  const flowCallbacks = useMemo(
    () => ({
      openMenu,
      deleteEdge: handleDeleteEdge,
    }),
    [openMenu, handleDeleteEdge],
  );

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const getNextNodeId = useCallback(() => `node_${nextIdRef.current++}`, []);

  const handlePaneClick = useCallback(() => {
    setMenuState(null);
    setSelectedNodeId(null);
  }, []);

  const onMove = useCallback(() => {
    setMenuState(null);
    setSelectedNodeId(null);
  }, []);

  return (
    <div className="canvas-layout">
      <div className="flow-canvas" ref={flowWrapperRef}>
        <HeaderTooltip
          setNodes={setNodes}
          edges={edges}
          nuberOfNodes={nuberOfNodes}
          setNumberOfNodes={setNumberOfNodes}
        />
        <FlowCallbacksProvider value={flowCallbacks}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onlyRenderVisibleElements={true}
            edgeTypes={edgeTypes}
            autoPanOnConnect={false}
            autoPanOnNodeDrag={false}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={handleEdgesDelete}
            onConnect={onConnect}
            onConnectStart={handleConnectStart}
            onConnectEnd={handleConnectEnd}
            onNodeDragStart={onGroupNodeDragStart}
            onNodeDrag={onGroupNodeDrag}
            onNodeClick={handleNodeClick}
            // connectionRadius={30}
            snapToGrid={true}
            onPaneClick={handlePaneClick}
            onMove={onMove}
            fitView
            minZoom={0.1}
          >
            <StaticBackground />
            <MiniMap />
            <StaticControls />
          </ReactFlow>

          {menuState && (
            <ConextMenuIndex
              menuState={menuState}
              setMenuState={setMenuState}
              nodes={nodes}
              edges={edges}
              nuberOfNodes={nuberOfNodes}
              setNodes={setNodes}
              setEdges={setEdges}
              setSelectedNodeId={setSelectedNodeId}
              getNextNodeId={getNextNodeId}
            />
          )}

          <SidebarIndex
            selectedNodeId={selectedNodeId}
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            getNextNodeId={getNextNodeId}
            onClose={() => setSelectedNodeId(null)}
          />
        </FlowCallbacksProvider>
      </div>
    </div>
  );
}
