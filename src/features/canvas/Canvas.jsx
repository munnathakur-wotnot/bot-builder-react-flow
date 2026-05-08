import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
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
import { useNodeActions } from "./hooks/useNodeActions";
import MultiSelectToolbar from "./MultiSelectToolbar";
import NodeSearchModal from "./NodeSearchModal";
import { validateAllNodesKeys } from "./validateNodes";
import { useFlowSimulation } from "./hooks/useFlowSimulation";
import useUpdateNode from "../../shared/hooks/useUpdateNode.js";
import { useFlowPaste } from "./hooks/useFlowPaste.js";
import { useFlowScope } from "./hooks/useFlowScope.js";
import { useCanvasIO } from "./hooks/useCanvasIO.js";
import FlowBreadcrumb from "./FlowBreadcrumb.jsx";
import { useToast } from "../../shared/ui/feedback/Toast.jsx";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

const StaticBackground = React.memo(function StaticBackground() {
  return <Background gap={20} size={1} />;
});

const StaticControls = React.memo(function StaticControls() {
  return <Controls />;
});

export default function CanvasFlow() {
  // ── State ────────────────────────────────────────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNodeId, _setSelectedNodeId] = useState(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [nuberOfNodes, setNumberOfNodes] = useState(0);
  const [menuState, setMenuState] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { ToastContainer } = useToast();

  // ── Refs ─────────────────────────────────────────────────────
  const nextIdRef = useRef(2);
  const flowWrapperRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const isHandleClickRef = useRef(false);
  const validationErrors = useRef(null);
  const selectedNodeIdRef = useRef(null);
  const pointerRef = useRef({ x: 100, y: 100 });

  // ── React Flow ───────────────────────────────────────────────
  const { fitView, screenToFlowPosition } = useReactFlow();
  const { updateSingleNode } = useUpdateNode(setNodes);

  validationErrors.current = useMemo(
    () => validateAllNodesKeys(nodes),
    [nodes],
  );

  // ── Helpers ──────────────────────────────────────────────────
  const getNextNodeId = useCallback(() => `node_${nextIdRef.current++}`, []);

  const setSelectedNodeId = useCallback((id) => {
    selectedNodeIdRef.current = id;
    _setSelectedNodeId(id);
  }, []);

  // Defined early so useFlowScope / useCanvasIO can receive it
  const setSelectedNodeIdUpdate = useCallback(
    (id = null) => {
      const prevSelectedId = selectedNodeIdRef.current;
      if (prevSelectedId) {
        updateSingleNode(prevSelectedId, (node) => ({
          ...node,
          data: { ...node.data, isErrorShow: true },
        }));
      }
      selectedNodeIdRef.current = id;
      _setSelectedNodeId(id);
    },
    [updateSingleNode],
  );

  // ── Feature hooks ────────────────────────────────────────────
  const {
    activeFlowId,
    visibleNodes,
    visibleEdges,
    flowOptions,
    activeFlowLabel,
    handleEnterFlow,
    handleGoHome,
    handleSelectFlow,
  } = useFlowScope({ nodes, edges, setSelectedNodeIdUpdate });

  const { importFileRef, handleImportChange, triggerImport, handleExport } =
    useCanvasIO({ nodes, edges, setNodes, setEdges });

  const getCursorFlowPosition = () =>
    screenToFlowPosition({ x: pointerRef.current.x, y: pointerRef.current.y });

  useFlowPaste({
    setNodes,
    setEdges,
    getNextNodeId,
    fitView,
    screenToFlowPosition,
    getCursorFlowPosition,
    activeFlowId,
  });

  const { isSimulating, simulationStore, startSimulation, stopSimulation } =
    useFlowSimulation();

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
    setSelectedNodeIdUpdate,
    getNextNodeId,
  });

  // ── Event handlers ───────────────────────────────────────────
  const openMenu = useCallback(
    ({ nodeId, x, y, type, isSelfLoop, isMenuOpen }) => {
      setMenuState({ nodeId, x, y, type, isSelfLoop, isMenuOpen });
    },
    [],
  );

  const handleNodeClick = useCallback(
    (e, node) => {
      if (isHandleClickRef.current) return;
      if (!node.data.isSubNode) setSelectedNodeId(node.id);
      else setSelectedNodeIdUpdate();
      setMenuState(null);
    },
    [setSelectedNodeId, setSelectedNodeIdUpdate],
  );

  const handleSelectionChange = useCallback(({ nodes: selected }) => {
    const ids = (selected ?? [])
      .filter(
        (n) =>
          n.data?.type !== "carouselCard" && n.data?.type !== "carouselButton",
      )
      .map((n) => n.id);
    setSelectedNodeIds(ids);
  }, []);

  const onMouseMove = useCallback((event) => {
    const bounds = flowWrapperRef.current?.getBoundingClientRect();
    if (!bounds) return;
    pointerRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  }, []);

  const handlePaneClick = useCallback(() => {
    setMenuState(null);
    setSelectedNodeIdUpdate();
    setSelectedNodeIds([]);
  }, [setSelectedNodeIdUpdate]);

  const onMove = useCallback(() => {
    setMenuState(null);
    setSelectedNodeIdUpdate();
  }, [setSelectedNodeIdUpdate]);

  const handleNodeFound = useCallback(
    (node) => {
      setSearchOpen(false);
      setSelectedNodeId(node.id);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, isSearchHighlight: true } }
            : { ...n, data: { ...n.data, isSearchHighlight: false } },
        ),
      );
      requestAnimationFrame(() =>
        fitView({ nodes: [{ id: node.id }], duration: 600, padding: 0.5 }),
      );
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) =>
            n.data?.isSearchHighlight
              ? { ...n, data: { ...n.data, isSearchHighlight: false } }
              : n,
          ),
        );
      }, 2500);
    },
    [fitView, setNodes, setSelectedNodeId],
  );

  const flowCallbacks = useMemo(
    () => ({
      openMenu,
      deleteEdge: handleDeleteEdge,
      deleteNode,
      copyNode,
      cloneNode,
      validationErrors,
      simulationStore,
      isHandleClickRef,
    }),
    [
      openMenu,
      handleDeleteEdge,
      deleteNode,
      copyNode,
      cloneNode,
      validationErrors,
      simulationStore,
    ],
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="canvas-layout">
      <input
        ref={importFileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleImportChange}
      />

      <div className="flow-canvas" ref={flowWrapperRef}>
        <HeaderTooltip
          setNodes={setNodes}
          edges={edges}
          totalNodes={nodes.length}
          nuberOfNodes={nuberOfNodes}
          setNumberOfNodes={setNumberOfNodes}
          onOpenSearch={() => setSearchOpen(true)}
          validationErrors={validationErrors.current}
          nodes={nodes}
          onSelectErrorNode={handleNodeFound}
          isSimulating={isSimulating}
          onTest={() => startSimulation(nodes, edges)}
          onStopTest={stopSimulation}
          onImport={triggerImport}
          onExport={handleExport}
        />

        <FlowCallbacksProvider value={flowCallbacks}>
          <ReactFlow
            nodes={visibleNodes}
            edges={visibleEdges}
            onMouseMove={onMouseMove}
            nodeTypes={nodeTypes}
            selectionMode={SelectionMode.Partial}
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
            onSelectionChange={handleSelectionChange}
            snapToGrid={true}
            onPaneClick={handlePaneClick}
            onMove={onMove}
            fitView
            minZoom={0.1}
          >
            <StaticBackground />
            <MiniMap />
            <StaticControls />

            <FlowBreadcrumb
              activeFlowId={activeFlowId}
              activeFlowLabel={activeFlowLabel}
              flowOptions={flowOptions}
              visibleNodes={visibleNodes}
              onGoHome={handleGoHome}
              onSelectFlow={handleSelectFlow}
            />

            {selectedNodeIds.length >= 1 && (
              <MultiSelectToolbar
                selectedIds={selectedNodeIds}
                onCopy={copyNodes}
                onClone={cloneNodes}
                onDelete={(ids) => {
                  deleteNodes(ids);
                  setSelectedNodeIds([]);
                }}
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
              getNextNodeId={getNextNodeId}
              activeFlowId={activeFlowId}
            />
          )}

          {!menuState && (
            <SidebarIndex
              selectedNodeId={selectedNodeId}
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              getNextNodeId={getNextNodeId}
              onClose={setSelectedNodeIdUpdate}
              onEnterFlow={handleEnterFlow}
            />
          )}

          <NodeSearchModal
            open={searchOpen}
            nodes={visibleNodes}
            onSelect={handleNodeFound}
            onClose={() => setSearchOpen(false)}
          />
        </FlowCallbacksProvider>
      </div>

      <ToastContainer />
    </div>
  );
}
