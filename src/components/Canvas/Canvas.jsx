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
import ContextMenu from "../Menu/ContextMenu";
import NodeSidebar from "../Sidebar/NodeSidebar";
import { INITIAL_EDGES, INITIAL_NODES } from "./constants";
import CustomEdge from "../Edges/CustumEdges";
import { FlowCallbacksProvider } from "./FlowCallbacksContext.jsx";
import HeaderTooltip from "../headerTooltip/HeaderTooltip.jsx";
import { removeNodeConnectionsForEdges } from "./utils.js";

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

  const handleConnectStart = useCallback(() => {
    flowWrapperRef.current?.classList.add("flow-connecting");
  }, []);
    const onConnect = useCallback(
    (params) => {
      // Allow only one outgoing connection per source node
      const alreadyConnected = edges.some((e) => e.source === params.source);
      if (alreadyConnected) return;

      setEdges((eds) => addEdge({ ...params, type: "custom" }, eds));
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === params.source) {
            const newOutPorts = [...(node.data.outPorts || []), params.target];
            return {
              ...node,
              data: {
                ...node.data,
                outPorts: newOutPorts,
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

      // Don't connect to start nodes
      const targetNode = nodesRef.current.find((n) => n.id === targetNodeId);
      if (!targetNode || targetNode.data?.type === "start") return;

      onConnect({ source: sourceNodeId, target: targetNodeId });
    },
    [onConnect],
  );

  const openMenu = useCallback(
    ({ nodeId, x, y }) => {
      setMenuState({ nodeId, x, y });
    },
    [setMenuState],
  );

  const handleDeleteEdge = useCallback(
    (edgeId, sourceId, targetId) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      setNodes((nds) =>
        removeNodeConnectionsForEdges(nds, [
          { id: edgeId, source: sourceId, target: targetId },
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
            // onlyRenderVisibleElements={true}
            edgeTypes={edgeTypes}
            autoPanOnConnect={false}
            autoPanOnNodeDrag={false}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={handleEdgesDelete}
            onConnect={onConnect}
            onConnectStart={handleConnectStart}
            onConnectEnd={handleConnectEnd}
            onNodeClick={handleNodeClick}
            // connectionRadius={30}
            // connectionMode="loose"
            // snapToGrid={true}
            onPaneClick={handlePaneClick}
            onMove={onMove}
            fitView
            minZoom={0.1}
          >
            <StaticBackground />
            <MiniMap />
            <StaticControls />
          </ReactFlow>
        </FlowCallbacksProvider>

        {menuState && (
          <ContextMenu
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

        <NodeSidebar
          selectedNodeId={selectedNodeId}
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          getNextNodeId={getNextNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
