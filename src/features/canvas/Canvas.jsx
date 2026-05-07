import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
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
  const [selectedNodeId, _setSelectedNodeId] = useState(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [nuberOfNodes, setNumberOfNodes] = useState(0);
  const [menuState, setMenuState] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState(null);
  const nextIdRef = useRef(2);
  const flowWrapperRef = useRef(null);
  const importFileRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const isHandleClickRef = useRef(false);
  const validationErrors = useRef(null);
  const { updateSingleNode } = useUpdateNode(setNodes);

  const { fitView, screenToFlowPosition } = useReactFlow();
  const selectedNodeIdRef = useRef(null);

  validationErrors.current = useMemo(
    () => validateAllNodesKeys(nodes),
    [nodes],
  );

  // Flow scoping — all nodes/edges share one array; filter by top-level flowId
  const visibleNodes = useMemo(
    () => nodes.filter((n) => (n.flowId ?? null) === activeFlowId),
    [nodes, activeFlowId],
  );

  const visibleEdges = useMemo(
    () => edges.filter((e) => (e.flowId ?? null) === activeFlowId),
    [edges, activeFlowId],
  );

  // Collect flow options from "flow" type nodes for the breadcrumb dropdown
  const flowOptions = useMemo(() => {
    return nodes
      .filter((n) => n.data.type === "flow" && n.data.targetFlowId)
      .map((n) => ({ id: n.data.targetFlowId, label: n.data.title || "Unnamed Flow" }));
  }, [nodes]);

  // Label of the currently active flow
  const activeFlowLabel = useMemo(() => {
    if (!activeFlowId) return null;
    return flowOptions.find((f) => f.id === activeFlowId)?.label ?? "Flow";
  }, [activeFlowId, flowOptions]);

  // fitView whenever the active flow changes
  useEffect(() => {
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 400 });
    });
  }, [activeFlowId, fitView]);

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

  const openMenu = useCallback(
    ({ nodeId, x, y, type, isSelfLoop, isMenuOpen }) => {
      setMenuState({ nodeId, x, y, type, isSelfLoop, isMenuOpen });
    },
    [],
  );

  const setSelectedNodeId = useCallback((id) => {
    selectedNodeIdRef.current = id;
    _setSelectedNodeId(id);
  }, []);

  const handleNodeClick = useCallback((e, node) => {
    if (isHandleClickRef.current) return;

    if (!node.data.isSubNode) {
      setSelectedNodeId(node.id);
    } else {
      setSelectedNodeIdUpdate();
    }
    setMenuState(null);
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

  const pointerRef = useRef({ x: 100, y: 100 });

  const onMouseMove = useCallback((event) => {
    const bounds = flowWrapperRef.current?.getBoundingClientRect();

    if (!bounds) return;

    pointerRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  }, []);
  const getCursorFlowPosition = () => {
    return screenToFlowPosition({
      x: pointerRef.current.x,
      y: pointerRef.current.y,
    });
  };

  useFlowPaste({
    setNodes,
    setEdges,
    getNextNodeId,
    fitView,
    screenToFlowPosition,
    getCursorFlowPosition,
  });

  const setSelectedNodeIdUpdate = useCallback(
    (id = null) => {
      const prevSelectedId = selectedNodeIdRef.current;

      // cleanup previous selected node
      if (prevSelectedId) {
        updateSingleNode(prevSelectedId, (node) => ({
          ...node,
          data: {
            ...node.data,
            isErrorShow: true,
          },
        }));
      }

      selectedNodeIdRef.current = id;
      _setSelectedNodeId(id);
    },
    [updateSingleNode],
  );

  const handleEnterFlow = useCallback(
    (targetFlowId) => {
      if (!targetFlowId) return;
      setSelectedNodeIdUpdate();
      setActiveFlowId(targetFlowId);
    },
    [setSelectedNodeIdUpdate],
  );

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

  const flowCallbacks = useMemo(
    () => ({
      openMenu,
      deleteEdge: handleDeleteEdge,
      deleteNode,
      copyNode,
      cloneNode,
      validationErrors,
      simulationStore, // stable ref — never changes, won't invalidate memo
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

  const handlePaneClick = useCallback(() => {
    setMenuState(null);
    setSelectedNodeIdUpdate();
    setSelectedNodeIds([]);
  }, []);

  const onMove = useCallback(() => {
    setMenuState(null);
    setSelectedNodeIdUpdate();
  }, []);

  const handleNodeFound = useCallback(
    (node) => {
      setSearchOpen(false);
      setSelectedNodeId(node.id);

      // Temporarily highlight the node
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, isSearchHighlight: true } }
            : { ...n, data: { ...n.data, isSearchHighlight: false } },
        ),
      );

      // Center on the node
      requestAnimationFrame(() => {
        fitView({
          nodes: [{ id: node.id }],
          duration: 600,
          padding: 0.5,
        });
      });

      // Remove highlight after 2.5s
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
    [fitView, setNodes],
  );

  const handleExport = useCallback(() => {
    const json = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleImportFile = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            alert('Invalid flow JSON: must have "nodes" and "edges" arrays.');
            return;
          }
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          requestAnimationFrame(() => fitView({ padding: 0.2, duration: 400 }));
        } catch {
          alert("Failed to parse JSON file.");
        }
      };
      reader.readAsText(file);
      // reset so the same file can be re-imported
      e.target.value = "";
    },
    [setNodes, setEdges, fitView],
  );

  return (
    <div className="canvas-layout">
      {/* Hidden file input for JSON import */}
      <input
        ref={importFileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleImportFile}
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
          onImport={() => importFileRef.current?.click()}
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

            {/* Flow breadcrumb panel */}
            <Panel position="top-left" className="flow-scope-panel">
              <div className="flow-scope-panel__breadcrumb">
                {/* Home button */}
                <button
                  className={`flow-scope-panel__home${activeFlowId === null ? " flow-scope-panel__home--active" : ""}`}
                  onClick={() => {
                    setSelectedNodeIdUpdate();
                    setActiveFlowId(null);
                  }}
                  title="Main Flow"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
                    <path d="M9 21V12h6v9" />
                  </svg>
                </button>

                {/* Slash + current flow name — shown only when inside a sub-flow */}
                {activeFlowId !== null && (
                  <>
                    <span className="flow-scope-panel__sep">/</span>
                    <span className="flow-scope-panel__current">{activeFlowLabel}</span>
                  </>
                )}

                {/* Dropdown chevron */}
                {flowOptions.length > 0 && (
                  <div className="flow-scope-panel__dropdown-wrap">
                    <button className="flow-scope-panel__chevron" aria-label="Select flow">
                      <svg width="10" height="10" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <select
                      className="flow-scope-panel__hidden-select"
                      value={activeFlowId ?? ""}
                      onChange={(e) => {
                        setSelectedNodeIdUpdate();
                        setActiveFlowId(e.target.value || null);
                      }}
                    >
                      <option value="">Main Flow</option>
                      {flowOptions.map((flow) => (
                        <option key={flow.id} value={flow.id}>
                          {flow.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Blocks counter */}
              <div className="flow-scope-panel__blocks">
                Blocks: {visibleNodes.filter((n) => !n.data.isSubNode).length}
              </div>
            </Panel>

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
    </div>
  );
}
