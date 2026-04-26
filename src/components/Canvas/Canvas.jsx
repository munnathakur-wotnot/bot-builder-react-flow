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

const nodeTypes = { custom: CustomNode };
const edgeTypes = {
  custom: CustomEdge,
};

export default function CanvasFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState(null);
  const [menuState, setMenuState] = useState(null);
  const nextIdRef = useRef(2);

  const nodesWithMappedData = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onOpenMenu: setMenuState,
        },
      })),
    [nodes],
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

  const edgesWithMappedData = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          onDeleteEdge: handleDeleteEdge,
        },
      })),
    [edges, handleDeleteEdge],
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
            const newOutPorts = [
              ...(node.data.outPorts || []),
              params.target,
            ];
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
            const newInPorts = [
              ...(node.data.inPorts || []),
              params.source,
            ];
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

  const selectedNodeData = selectedNode ?? null;

  return (
    <div className="canvas-layout">
      <div className="flow-canvas">
        <ReactFlow
          nodes={nodesWithMappedData}
          edges={edgesWithMappedData}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onPaneClick={() => {
            setMenuState(null);
            setSelectedNode(null);
          }}
          fitView
        >
          <Background gap={20} size={1} />
          <MiniMap />
          <Controls />
        </ReactFlow>

        <ContextMenu
          menuState={menuState}
          setMenuState={setMenuState}
          nodes={nodes}
          setNodes={setNodes}
          setEdges={setEdges}
          setSelectedNode={setSelectedNode}
          getNextNodeId={getNextNodeId}
        />

        <NodeSidebar
          selectedNode={selectedNodeData}
          setSelectedNode={setSelectedNode}
          setNodes={setNodes}
          setEdges={setEdges}
          getNextNodeId={getNextNodeId}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
