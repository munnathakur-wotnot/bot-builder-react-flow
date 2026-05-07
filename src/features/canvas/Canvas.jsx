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
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [nuberOfNodes, setNumberOfNodes] = useState(0);
  const [menuState, setMenuState] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const nextIdRef = useRef(2);
  const flowWrapperRef = useRef(null);
  const importFileRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const isHandleClickRef = useRef(false);
  const validationErrors = useRef(null);

  const { fitView } = useReactFlow();

  validationErrors.current = useMemo(
    () => validateAllNodesKeys(nodes),
    [nodes],
  );

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

  const handleNodeClick = useCallback((e, node) => {
    if (isHandleClickRef.current) return;

    if (!node.data.isSubNode) {
      setSelectedNodeId(node.id);
    } else {
      setSelectedNodeId(null);
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
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
  }, []);

  const onMove = useCallback(() => {
    setMenuState(null);
    setSelectedNodeId(null);
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
            nodes={nodes}
            edges={edges}
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
              setSelectedNodeId={setSelectedNodeId}
              getNextNodeId={getNextNodeId}
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
              onClose={() => setSelectedNodeId(null)}
            />
          )}

          <NodeSearchModal
            open={searchOpen}
            nodes={nodes}
            onSelect={handleNodeFound}
            onClose={() => setSearchOpen(false)}
          />
        </FlowCallbacksProvider>
      </div>
    </div>
  );
}
