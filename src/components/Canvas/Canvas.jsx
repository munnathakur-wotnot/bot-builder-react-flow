import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useReactFlow,
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
import { layoutNodesDagre } from "./layout";

const nodeTypes = { custom: CustomNode };
const edgeTypes = {
  custom: CustomEdge,
};

export default function CanvasFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [menuState, setMenuState] = useState(null);
  const nextIdRef = useRef(2);
  const { fitView } = useReactFlow();

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
        nds.map((node) => {
          if (node.id === sourceId) {
            const newOutPorts = (node.data.outPorts || []).filter(
              (p) => p !== targetId,
            );
            return {
              ...node,
              data: {
                ...node.data,
                outPorts: newOutPorts,
                connected: newOutPorts.length > 0,
              },
            };
          }
          if (node.id === targetId) {
            const newInPorts = (node.data.inPorts || []).filter(
              (p) => p !== sourceId,
            );
            return {
              ...node,
              data: {
                ...node.data,
                inPorts: newInPorts,
                connected: newInPorts.length > 0,
              },
            };
          }
          return node;
        }),
      );
    },
    [setEdges, setNodes],
  );

  const flowCallbacks = useMemo(
    () => ({
      openMenu,
      deleteEdge: handleDeleteEdge,
    }),
    [openMenu, handleDeleteEdge],
  );

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

  const getNextNodeId = useCallback(() => `node_${nextIdRef.current++}`, []);

  const onAutoLayout = useCallback(() => {
    setNodes((currNodes) => layoutNodesDagre(currNodes, edges));
    // Let React apply positions first, then fit.
    requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
  }, [edges, fitView, setNodes]);

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

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
      <div className="flow-canvas">
        <div className="layout-toolbar">
          <button
            type="button"
            className="layout-toolbar__btn"
            onClick={onAutoLayout}
          >
            Auto layout
          </button>
        </div>
        <FlowCallbacksProvider value={flowCallbacks}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onMove={onMove}
            fitView
            minZoom={0.1}
          >
            <Background gap={20} size={1} />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </FlowCallbacksProvider>

        {menuState && (
          <ContextMenu
            menuState={menuState}
            setMenuState={setMenuState}
            nodes={nodes}
            setNodes={setNodes}
            setEdges={setEdges}
            setSelectedNodeId={setSelectedNodeId}
            getNextNodeId={getNextNodeId}
          />
        )}

        <NodeSidebar
          selectedNodeId={selectedNodeId}
          nodes={nodes}
          setNodes={setNodes}
          setEdges={setEdges}
          getNextNodeId={getNextNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
