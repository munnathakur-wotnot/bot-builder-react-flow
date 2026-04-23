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
import useNodeDataMap from "../../hooks/useNodeDataMap";
import ContextMenu from "../Menu/ContextMenu";
import NodeSidebar from "../Sidebar/NodeSidebar";
import { INITIAL_EDGES, INITIAL_NODES, MENU_NODE_TEMPLATES } from "./constants";
import { buildAddCarouselCardPayload, buildMenuActionMap } from "./utils";

const nodeTypes = { custom: CustomNode };

export default function CanvasFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [menuState, setMenuState] = useState(null);
  const { nodeDataMap, updateNodeData, setNodeDataMap } = useNodeDataMap();
  const nextIdRef = useRef(2);

  const onConnect = useCallback(
    (params) => setEdges((currentEdges) => addEdge(params, currentEdges)),
    [setEdges],
  );

  const getNextNodeId = useCallback(() => `node_${nextIdRef.current++}`, []);

  const nodesWithMappedData = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          nodeDataMap,
          onOpenMenu: setMenuState,
        },
      })),
    [nodes, nodeDataMap],
  );

  const selectedNodeData = selectedNodeId ? nodeDataMap[selectedNodeId] : null;

  const handleMenuSelect = useCallback(
    (optionId) => {
      if (!menuState?.nodeId) return;

      const sourceNode = nodes.find((node) => node.id === menuState.nodeId);
      if (!sourceNode) return;

      const context = {
        sourceNode,
        sourceNodeId: menuState.nodeId,
      };
      const actionByOption = buildMenuActionMap({
        context,
        templates: MENU_NODE_TEMPLATES,
        getNextNodeId,
      });
      const buildPayload = actionByOption[optionId];
      if (!buildPayload) {
        setMenuState(null);
        return;
      }

      const payload = buildPayload();
      setNodes((currentNodes) => [...currentNodes, ...payload.nodesToAdd]);
      setEdges((currentEdges) => [...currentEdges, ...payload.edgesToAdd]);
      setNodeDataMap((prev) => ({ ...prev, ...payload.dataPatch }));
      setSelectedNodeId(payload.selectedNodeId);

      setMenuState(null);
    },
    [menuState, nodes, setNodeDataMap, setNodes, setEdges, getNextNodeId],
  );

  const handleAddCarouselCard = useCallback(() => {
    if (!selectedNodeId) return;
    const carouselNodeData = nodeDataMap[selectedNodeId];
    if (!carouselNodeData || carouselNodeData.type !== "carousel") return;

    const carouselNode = nodes.find((node) => node.id === selectedNodeId);
    if (!carouselNode) return;

    const payload = buildAddCarouselCardPayload({
      selectedNodeId,
      carouselNodeData,
      carouselNode,
      getNextNodeId,
    });

    setNodes((currentNodes) => [...currentNodes, ...payload.nodesToAdd]);
    setEdges((currentEdges) => [...currentEdges, ...payload.edgesToAdd]);
    setNodeDataMap((prev) => ({
      ...prev,
      [selectedNodeId]: {
        ...prev[selectedNodeId],
        ...payload.dataPatch[selectedNodeId],
      },
      ...Object.fromEntries(
        Object.entries(payload.dataPatch).filter(
          ([nodeId]) => nodeId !== selectedNodeId,
        ),
      ),
    }));
  }, [
    selectedNodeId,
    nodeDataMap,
    nodes,
    setNodeDataMap,
    setNodes,
    setEdges,
    getNextNodeId,
  ]);

  return (
    <div className="canvas-layout">
      <div className="flow-canvas">
        <ReactFlow
          nodes={nodesWithMappedData}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => {
            setMenuState(null);
            setSelectedNodeId(null);
          }}
          fitView
        >
          <Background gap={20} size={1} />
          <MiniMap />
          <Controls />
        </ReactFlow>

        <ContextMenu
          position={menuState ? { x: menuState.x, y: menuState.y } : null}
          onSelect={handleMenuSelect}
          onClose={() => setMenuState(null)}
        />

        <NodeSidebar
          selectedNodeData={selectedNodeData}
          onChangeTitle={(title) => updateNodeData(selectedNodeId, { title })}
          onChangeDescription={(description) =>
            updateNodeData(selectedNodeId, { description })
          }
          onAddCarouselCard={handleAddCarouselCard}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
