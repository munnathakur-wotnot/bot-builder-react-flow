import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./Canvas.css";
import CustomNode from "../nodes/CustomNode";
import { INITIAL_EDGES, INITIAL_NODES } from "./constants";
import CustomEdge from "../edges/CustomEdge";
import { FlowCallbacksProvider } from "./FlowCallbacksContext.jsx";
import HeaderTooltip from "../../shared/ui/tooltip/HeaderTooltip.jsx";
import SidebarIndex from "../sidebar/index.jsx";
import ConextMenuIndex from "../context-menu/index.jsx";
import { useGroupDrag } from "./hooks/useGroupDrag";
import { useFlowConnections } from "./hooks/useFlowConnections";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

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

  const { onGroupNodeDragStart, onGroupNodeDrag } = useGroupDrag(nodesRef, setNodes);

  const {
    handleConnectStart,
    onConnect,
    handleConnectEnd,
    handleDeleteEdge,
    handleEdgesDelete,
  } = useFlowConnections({ edges, setEdges, setNodes, nodesRef, flowWrapperRef });

  const openMenu = useCallback(
    ({ nodeId, x, y, type, isSelfLoop }) => {
      setMenuState({ nodeId, x, y, type, isSelfLoop });
    },
    [],
  );

  const flowCallbacks = useMemo(
    () => ({ openMenu, deleteEdge: handleDeleteEdge }),
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
 