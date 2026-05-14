import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Background,
  Controls,
  ReactFlow,
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./Canvas.css";
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
// import FlowBreadcrumb from "./FlowBreadcrumb.jsx";
import { useToast } from "../../shared/ui/feedback/Toast.jsx";
import { useCollabSocket } from "./hooks/useCollabSocket.js";
// import { useCursorStore } from "../socket/useCursorStore.js";
import { getMeStamp } from "../socket/useCursorStore.js";
import socket from "../socket/useSocket.js";
import { viewportStore } from "../../shared/hooks/useViewportStore.js";
import { EPHEMERAL_NODE_KEYS } from "./constants.js";
import { useAutoSave } from "./hooks/useAutoSave.js";
import { useSyncCompressed } from "./hooks/useSyncCompressed.js";
import TextNode from "../nodes/TextNode.jsx";
import ActionNode from "../nodes/ActionNode.jsx";
import CustomSubNode from "../nodes/CustomSubNode.jsx";

/**
 * action  → ActionNode   (start, delay, jump, flowStart — small pill nodes)
 * text    → TextNode     (ai_answer, collectInput, form, carousel, conditionRoot, flow — card nodes)
 * subnode → CustomSubNode (carouselCard, carouselButton, condition, defaultCondition — child nodes)
 */
const nodeTypes = {
  action: ActionNode,
  text: TextNode,
  subnode: CustomSubNode,
};
const edgeTypes = { advanced: CustomEdge, custom: CustomEdge };

// Fields that are managed purely by socket events and must never be persisted
// (defined in constants.js — imported above)

const StaticBackground = React.memo(function StaticBackground() {
  return <Background gap={20} size={1} />;
});

const StaticControls = React.memo(function StaticControls() {
  return <Controls />;
});

export default function CanvasFlow() {
  // ── State ────────────────────────────────────────────────────

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Stores the non-node/edge metadata from the last imported old-format JSON
  // (id, version, gridSize, extraInfo, etc.) so export can reconstruct the same format.
  const flowMetaRef = useRef({});

  const [selectedNodeId, _setSelectedNodeId] = useState(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [nuberOfNodes, setNumberOfNodes] = useState(0);
  const [menuState, setMenuState] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { ToastContainer, pushToast } = useToast();
  // const { cursors, me } = useCursorStore();
  const isRemoteUpdateRef = useRef(false);
  // Prevents save-flow from firing before get-flow callback returns (avoids
  // broadcasting empty [] on mount and overwriting a peer's canvas)
  const isInitializedRef = useRef(false);
  // Tracks node IDs from the last flow-updated received from server.
  // Used to distinguish "locally-added (pending)" nodes from "deleted by peer" nodes
  // so that flow-updated never wipes a node the local client just added.
  const lastIncomingNodeIdsRef = useRef(new Set());
  // Same guard for edges — prevents a peer's stale save from wiping a locally-added edge.
  const lastIncomingEdgeIdsRef = useRef(new Set());

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
  const { fitView, screenToFlowPosition, getViewport } = useReactFlow();
  const { updateSingleNode } = useUpdateNode(setNodes);
  const isCompressed = useSyncCompressed();

  //performance Testing

  const [startChecking, setStartChecking] = useState(false);

  const hasMeasuredInitialRender = useRef(false);
  const appStartTimeRef = useRef(0);

  const startPerformanceTest = () => {
    hasMeasuredInitialRender.current = false;

    // reset exact start time HERE
    appStartTimeRef.current = performance.now();

    setStartChecking(true);
  };

  useEffect(() => {
    if (!startChecking) return;

    if (hasMeasuredInitialRender.current) return;

    if (!nodes.length && !edges.length) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const renderTime = performance.now() - appStartTimeRef.current;

        console.log(`Initial Canvas Render: ${renderTime.toFixed(2)}ms`);

        hasMeasuredInitialRender.current = true;

        setStartChecking(false);
      });
    });
  }, [startChecking, nodes, edges]);

  // ── Collaborative socket hook ────────────────────────────────
  const {
    remoteDragMapRef,
    emitDragStart,
    emitDragEnd,
    remoteTypingMap,
    emitTypingStart,
    emitTypingEnd,
  } = useCollabSocket({
    selectedNodeId,
    menuState,
    updateSingleNode,
    setNodes,
  });

  validationErrors.current = useMemo(
    () => validateAllNodesKeys(nodes),
    [nodes],
  );

  useEffect(() => {
    socket.emit("get-flow", { roomId: "room-1" }, (flow) => {
      // Mark as remote update so the save-flow effect doesn't re-broadcast
      // the just-loaded state back to the server
      // START TIMER HERE
      appStartTimeRef.current = performance.now();

      isRemoteUpdateRef.current = true;
      const loadedNodes = flow.nodes || [];
      const loadedEdges = flow.edges || [];
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      nextIdRef.current = flow.currentId || 1;
      // Seed both refs so the first flow-updated can correctly
      // distinguish "locally added" items from "deleted by a peer".
      lastIncomingNodeIdsRef.current = new Set(loadedNodes.map((n) => n.id));
      lastIncomingEdgeIdsRef.current = new Set(loadedEdges.map((e) => e.id));
      // Now safe to start saving local changes
      isInitializedRef.current = true;
    });
  }, []);

  // Tracks the last structurally-clean snapshot we sent to the server so we can
  // skip a save when only ephemeral fields (drag/selection/menu labels) changed.
  const prevSaveSnapshotRef = useRef(null);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    // Strip ephemeral collab fields so the server never stores stale labels
    const cleanNodes = nodes.map((n) => {
      const hasEphemeral = EPHEMERAL_NODE_KEYS.some((k) => k in n.data);
      if (!hasEphemeral) return n;
      const cleanData = { ...n.data };
      EPHEMERAL_NODE_KEYS.forEach((k) => delete cleanData[k]);
      return { ...n, data: cleanData };
    });

    // Skip the emit when nothing structural has changed (e.g. only a drag
    // highlight or selection label updated). This dramatically reduces the
    // number of saves and the window for the "stale overwrite" race condition.
    const snapshot = JSON.stringify({ nodes: cleanNodes, edges });
    if (snapshot === prevSaveSnapshotRef.current) return;
    prevSaveSnapshotRef.current = snapshot;

    socket.emit("save-flow", {
      roomId: "room-1",
      nodes: cleanNodes,
      edges,
      currentId: nextIdRef.current,
    });
  }, [nodes, edges, nextIdRef]);

  useEffect(() => {
    socket.on(
      "flow-updated",
      ({ nodes: incomingNodes, edges: incomingEdges, currentId }) => {
        isRemoteUpdateRef.current = true;

        // Snapshot the PREVIOUS set of server-confirmed IDs before updating the ref.
        // This lets setNodes' callback distinguish between:
        //   (a) nodes locally added but not yet confirmed by server  → KEEP
        //   (b) nodes that a peer explicitly deleted (were in prevIds, now gone) → REMOVE
        const prevIncomingIds = lastIncomingNodeIdsRef.current;
        lastIncomingNodeIdsRef.current = new Set(
          incomingNodes.map((n) => n.id),
        );

        // Same snapshot pattern for edges.
        const prevIncomingEdgeIds = lastIncomingEdgeIdsRef.current;
        lastIncomingEdgeIdsRef.current = new Set(
          incomingEdges.map((e) => e.id),
        );

        // Preserve any live ephemeral collab state (drag/selection/menu labels)
        // so an unrelated remote change doesn't wipe an active label
        setNodes((curr) => {
          const ephemeralById = {};
          curr.forEach((n) => {
            const patch = {};
            EPHEMERAL_NODE_KEYS.forEach((k) => {
              if (n.data[k] !== undefined) patch[k] = n.data[k];
            });
            if (Object.keys(patch).length) ephemeralById[n.id] = patch;
          });

          const incomingMap = new Map(incomingNodes.map((n) => [n.id, n]));

          // Start result with all server-confirmed nodes (ephemeral state preserved)
          const result = incomingNodes.map((n) => {
            const ep = ephemeralById[n.id];
            if (!ep) return n;
            return { ...n, data: { ...n.data, ...ep } };
          });

          // Also keep any locally-added node that the server hasn't confirmed yet.
          // A node is "locally pending" when it is:
          //   • in our current local state (curr), AND
          //   • NOT in this flow-updated's incomingNodes (server doesn't have it yet), AND
          //   • NOT in the previous flow-updated (if it was there before and is now gone,
          //     a peer deleted it intentionally — so we should NOT keep it).
          curr.forEach((localNode) => {
            if (
              !incomingMap.has(localNode.id) &&
              !prevIncomingIds.has(localNode.id)
            ) {
              result.push(localNode);
            }
          });

          return result;
        });

        // Merge edges with the same logic: keep locally-added edges that the server
        // hasn't confirmed yet, remove edges a peer explicitly deleted.
        setEdges((currEdges) => {
          const incomingEdgeMap = new Map(incomingEdges.map((e) => [e.id, e]));

          // Start with all server-confirmed edges
          const result = [...incomingEdges];

          // Keep locally-added edges (in currEdges, not in incomingEdges, not in prevIncomingEdgeIds)
          // If an edge was in prevIncomingEdgeIds but missing now → peer deleted it → don't keep.
          currEdges.forEach((localEdge) => {
            if (
              !incomingEdgeMap.has(localEdge.id) &&
              !prevIncomingEdgeIds.has(localEdge.id)
            ) {
              result.push(localEdge);
            }
          });

          return result;
        });

        nextIdRef.current = currentId;
      },
    );

    return () => {
      socket.off("flow-updated");
    };
  }, []);
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
    // visibleNodes,
    // visibleEdges,
    // flowOptions,
    // activeFlowLabel,
    handleEnterFlow,
    // handleGoHome,
    // handleSelectFlow,
  } = useFlowScope({ nodes, edges, setSelectedNodeIdUpdate });

  const { importFileRef, handleImportChange, triggerImport, handleExport } =
    useCanvasIO({
      nodes,
      edges,
      setNodes,
      setEdges,
      setStartChecking: startPerformanceTest,
      flowMetaRef,
      getViewport,
    });

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

  useAutoSave({ nodes, edges, nextIdRef, flowMetaRef, getViewport });

  const { onGroupNodeDragStart, onGroupNodeDrag } = useGroupDrag(
    nodesRef,
    setNodes,
  );

  // ── Collaborative drag handlers ──────────────────────────────
  const handleNodeDragStart = useCallback(
    (event, node) => {
      if (remoteDragMapRef.current[node.id]) return;
      emitDragStart(node.id);
      onGroupNodeDragStart(event, node);
    },
    [onGroupNodeDragStart, remoteDragMapRef, emitDragStart],
  );

  const handleNodeDrag = useCallback(
    (event, node) => {
      if (remoteDragMapRef.current[node.id]) return;
      onGroupNodeDrag(event, node);
    },
    [onGroupNodeDrag, remoteDragMapRef],
  );

  const handleNodeDragStop = useCallback(
    (_, node) => {
      emitDragEnd(node.id);
      const stamp = getMeStamp();
      if (stamp) {
        updateSingleNode(node.id, (n) => ({
          ...n,
          draggable: true,
          data: { ...n.data, lastUpdatedBy: stamp },
        }));
      }
    },
    [emitDragEnd, updateSingleNode],
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
      // Block if a remote user already has this node's menu open
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (node?.data?.isMenuOpenBy) {
        pushToast(`Menu is already open by ${node.data.isMenuOpenBy}`, "info");
        return;
      }
      setMenuState({ nodeId, x, y, type, isSelfLoop, isMenuOpen });
    },
    [nodesRef, pushToast],
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

  const onMouseMove = useCallback(
    (event) => {
      const bounds = flowWrapperRef.current?.getBoundingClientRect();

      if (!bounds) return;

      // screen -> flow coordinates
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // local pointer ref
      pointerRef.current = {
        x: flowPosition.x,
        y: flowPosition.y,
      };

      // realtime cursor sync — emit flow coordinates so peers can convert
      // to their own screen space regardless of zoom/pan
      socket.emit("cursor-move", {
        x: flowPosition.x,
        y: flowPosition.y,
        isFlow: true,
      });
    },
    [screenToFlowPosition],
  );

  const handlePaneClick = useCallback(() => {
    setMenuState(null);
    setSelectedNodeIdUpdate();
    setSelectedNodeIds([]);
  }, [setSelectedNodeIdUpdate]);

  const onMove = useCallback(
    (event, viewport) => {
      viewportStore.setViewport(viewport);

      setMenuState(null);
      setSelectedNodeIdUpdate();
    },
    [setSelectedNodeIdUpdate],
  );

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

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node, index) => ({
        ...node,
        position: {
          ...node.position,
          y: index * (isCompressed ? 120 : 220),
        },
      })),
    );
  }, [isCompressed, setNodes]);

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
          setEdges={setEdges}
          totalNodes={nodes.length}
          setStartChecking={startPerformanceTest}
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
            nodes={nodes}
            edges={edges}
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
            onNodeDragStart={handleNodeDragStart}
            onNodeDrag={handleNodeDrag}
            onNodeDragStop={handleNodeDragStop}
            onNodeClick={handleNodeClick}
            onSelectionChange={handleSelectionChange}
            snapToGrid={true}
            onPaneClick={handlePaneClick}
            onMove={onMove}
            fitView
            minZoom={0.1}
          >
            <StaticBackground />
            {/* <MiniMap /> */}
            <StaticControls />

            {/* <FlowBreadcrumb
              activeFlowId={activeFlowId}
              activeFlowLabel={activeFlowLabel}
              flowOptions={flowOptions}
              visibleNodes={visibleNodes}
              onGoHome={handleGoHome}
              onSelectFlow={handleSelectFlow}
            /> */}

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
              remoteTypingMap={remoteTypingMap}
              emitTypingStart={emitTypingStart}
              emitTypingEnd={emitTypingEnd}
              getNextNodeId={getNextNodeId}
              onClose={setSelectedNodeIdUpdate}
              onEnterFlow={handleEnterFlow}
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

      <ToastContainer />
    </div>
  );
}
