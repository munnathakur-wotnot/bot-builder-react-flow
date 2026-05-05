import React, { useCallback, useDeferredValue, useMemo, useRef, useState } from "react";
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
import CustomEdge, { MemoCustomEdge } from "../edges/CustomEdge";
import { FlowCallbacksProvider } from "./FlowCallbacksContext.jsx";
import HeaderTooltip from "../../shared/ui/tooltip/HeaderTooltip.jsx";
import SidebarIndex from "../sidebar/index.jsx";
import ConextMenuIndex from "../context-menu/index.jsx";
import { useGroupDrag } from "./hooks/useGroupDrag";
import { useFlowConnections } from "./hooks/useFlowConnections";
import { useNodeActions } from "./hooks/useNodeActions";
import MultiSelectToolbar from "./MultiSelectToolbar";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: MemoCustomEdge };

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
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [nuberOfNodes, setNumberOfNodes] = useState(0);
  const [menuState, setMenuState] = useState(null);
  const nextIdRef = useRef(2);
  const flowWrapperRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const menuStateRef = useRef(menuState);
  menuStateRef.current = menuState;
  const selectedNodeIdRef = useRef(selectedNodeId);
  selectedNodeIdRef.current = selectedNodeId;

  // Sidebar only needs node data (title, type, fields) — not live positions.
  // useDeferredValue lets React skip sidebar re-renders on every drag-position
  // update and schedule them at low priority when the browser is idle.
  const deferredNodes = useDeferredValue(nodes);

  // KEY PERF FIX: during a drag, ReactFlow fires onNodesChange with
  // {type:'position', dragging:true} on every mousemove (~60/s). Each call
  // normally triggers setNodes → full CanvasFlow re-render. But ReactFlow
  // already drives the visual drag via its internal Zustand store + CSS
  // transforms — React state doesn't need updating until drag ends.
  // Filtering these out reduces re-renders from ~60/s to 1 per drag.
  const filteredOnNodesChange = useCallback(
    (changes) => {
      const meaningful = changes.filter(
        (c) => c.type !== "position" || c.dragging !== true,
      );
      if (meaningful.length > 0) onNodesChange(meaningful);
    },
    [onNodesChange],
  );

  const { onGroupNodeDragStart, onGroupNodeDrag } = useGroupDrag(
    nodesRef,
    setNodes,
  );

  const {
    handleConnectStart,
    onConnect,
    handleConnectEnd,
    handleDeleteEdge,
    handleEdgesDelete,
  } = useFlowConnections({
    edges,
    setEdges,
    setNodes,
    nodesRef,
    flowWrapperRef,
  });

  const openMenu = useCallback(({ nodeId, x, y, type, isSelfLoop }) => {
    setMenuState({ nodeId, x, y, type, isSelfLoop });
  }, []);

  const handleNodeClick = useCallback((_, node) => {
    if (!node.data.isSubNode) {
      setSelectedNodeId(node.id);
    } else {
      setSelectedNodeId(null);
    }
  }, []);

  const handleSelectionChange = useCallback(({ nodes: selected }) => {
    // Only track root-level selectable nodes (skip carousel sub-nodes)
    const ids = (selected ?? [])
      .filter(
        (n) =>
          n.data?.type !== "carouselCard" && n.data?.type !== "carouselButton",
      )
      .map((n) => n.id);
    setSelectedNodeIds(ids);
  }, []);

  const getNextNodeId = useCallback(() => `node_${nextIdRef.current++}`, []);

  const {
    deleteNode,
    copyNode,
    cloneNode,
    deleteNodes,
    copyNodes,
    cloneNodes,
  } = useNodeActions({
    nodesRef,
    edges,
    setNodes,
    setEdges,
    setSelectedNodeId,
    getNextNodeId,
  });

  const flowCallbacks = useMemo(
    () => ({
      openMenu,
      deleteEdge: handleDeleteEdge,
      deleteNode,
      copyNode,
      cloneNode,
    }),
    [openMenu, handleDeleteEdge, deleteNode, copyNode, cloneNode],
  );

  const handlePaneClick = useCallback(() => {
    setMenuState(null);
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
  }, []);

  const onMove = useCallback(() => {
    // Only update state when something actually needs to change.
    // Calling setState unconditionally here fires a full Canvas re-render on
    // every pan/zoom frame, forcing 1000+ memo comparisons per frame.
    if (menuStateRef.current !== null) setMenuState(null);
    if (selectedNodeIdRef.current !== null) setSelectedNodeId(null);
  }, []);

  // Stable callbacks for JSX — inline arrows create new references every
  // render, preventing memo from bailing out on SidebarIndex / MultiSelectToolbar.
  const handleSidebarClose = useCallback(() => setSelectedNodeId(null), []);
  const handleMultiSelectDelete = useCallback(
    (ids) => {
      deleteNodes(ids);
      setSelectedNodeIds([]);
    },
    [deleteNodes],
  );

  return (
    <div className="canvas-layout">
      <div className="flow-canvas" ref={flowWrapperRef}>
        <HeaderTooltip
          setNodes={setNodes}
          edges={edges}
          totalNodes={nodes.length}
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
            onNodesChange={filteredOnNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={handleEdgesDelete}
            onConnect={onConnect}
            onConnectStart={handleConnectStart}
            onConnectEnd={handleConnectEnd}
            onNodeDragStart={onGroupNodeDragStart}
            onNodeDrag={onGroupNodeDrag}
            onNodeClick={handleNodeClick}
            onSelectionChange={handleSelectionChange}
            onPaneClick={handlePaneClick}
            onMove={onMove}
            fitView
            minZoom={0.1}
          >
            <StaticBackground />
            {nodes.length <= 200 && <MiniMap />}
            <StaticControls />
            {selectedNodeIds.length >= 1 && (
              <MultiSelectToolbar
                selectedIds={selectedNodeIds}
                onCopy={copyNodes}
                onClone={cloneNodes}
                onDelete={handleMultiSelectDelete}
              />
            )}
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
            nodes={deferredNodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            getNextNodeId={getNextNodeId}
            onClose={handleSidebarClose}
          />
        </FlowCallbacksProvider>
      </div>
    </div>
  );
}
