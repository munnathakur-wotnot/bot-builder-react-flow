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

const initialNodes = [
  {
    id: "node_1",
    type: "custom",
    position: { x: 120, y: 120 },
    data: { id: "node_1" },
  },
];

const initialEdges = [];
const nodeTypes = { custom: CustomNode };

export default function CanvasFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [menuState, setMenuState] = useState(null);
  const { nodeDataMap, updateNodeData, setNodeDataMap } = useNodeDataMap();
  const nextIdRef = useRef(2);

  const onConnect = useCallback(
    (params) => setEdges((currentEdges) => addEdge(params, currentEdges)),
    [setEdges],
  );

  const createFlowNode = useCallback((id, x, y) => {
    return {
      id,
      type: "custom",
      position: { x, y },
      data: { id },
    };
  }, []);

  const createEdge = useCallback((source, target) => {
    return {
      id: `edge_${source}_${target}`,
      source,
      target,
      type: "smoothstep",
    };
  }, []);

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

      const nextByType = {
        collectInput: {
          type: "collectInput",
          title: "Name",
          description: "Please enter your name.",
        },
      };

      const nextNodeData = nextByType[optionId];
      if (optionId === "carousel") {
        const carouselId = `node_${nextIdRef.current++}`;
        const cardOneId = `node_${nextIdRef.current++}`;
        const cardTwoId = `node_${nextIdRef.current++}`;
        const buttonOneId = `node_${nextIdRef.current++}`;
        const buttonTwoId = `node_${nextIdRef.current++}`;

        const carouselX = sourceNode.position.x;
        const carouselY = sourceNode.position.y + 220;
        const cardY = carouselY + 120;
        const buttonY = cardY + 100;

        const newNodes = [
          createFlowNode(carouselId, carouselX, carouselY),
          createFlowNode(cardOneId, carouselX - 120, cardY),
          createFlowNode(cardTwoId, carouselX + 120, cardY),
          createFlowNode(buttonOneId, carouselX - 120, buttonY),
          createFlowNode(buttonTwoId, carouselX + 120, buttonY),
        ];

        const newEdges = [
          createEdge(menuState.nodeId, carouselId),
          createEdge(carouselId, cardOneId),
          createEdge(carouselId, cardTwoId),
          createEdge(cardOneId, buttonOneId),
          createEdge(cardTwoId, buttonTwoId),
        ];

        setNodes((currentNodes) => [...currentNodes, ...newNodes]);
        setEdges((currentEdges) => [...currentEdges, ...newEdges]);
        setNodeDataMap((prev) => ({
          ...prev,
          [carouselId]: {
            type: "carousel",
            title: "Carousel 1",
            description: "Swipe to explore cards",
            cards: [cardOneId, cardTwoId],
          },
          [cardOneId]: {
            type: "carouselCard",
            title: "Card 1",
            description: "",
          },
          [cardTwoId]: {
            type: "carouselCard",
            title: "Card 2",
            description: "",
          },
          [buttonOneId]: {
            type: "carouselButton",
            title: "Button 1",
            description: "",
          },
          [buttonTwoId]: {
            type: "carouselButton",
            title: "Button 1",
            description: "",
          },
        }));
        setSelectedNodeId(carouselId);
      } else if (nextNodeData) {
        const newNodeId = `node_${nextIdRef.current++}`;
        const newNode = {
          id: newNodeId,
          type: "custom",
          position: {
            x: sourceNode.position.x,
            y: sourceNode.position.y + 220,
          },
          data: { id: newNodeId },
        };

        setNodes((currentNodes) => [...currentNodes, newNode]);
        setEdges((currentEdges) =>
          addEdge(
            {
              id: `edge_${menuState.nodeId}_${newNodeId}`,
              source: menuState.nodeId,
              target: newNodeId,
              type: "smoothstep",
            },
            currentEdges,
          ),
        );
        setNodeDataMap((prev) => ({
          ...prev,
          [newNodeId]: nextNodeData,
        }));
        setSelectedNodeId(newNodeId);
      }

      setMenuState(null);
    },
    [
      menuState,
      nodes,
      setNodeDataMap,
      setNodes,
      setEdges,
      createFlowNode,
      createEdge,
    ],
  );

  const handleAddCarouselCard = useCallback(() => {
    if (!selectedNodeId) return;
    const carouselNodeData = nodeDataMap[selectedNodeId];
    if (!carouselNodeData || carouselNodeData.type !== "carousel") return;

    const carouselNode = nodes.find((node) => node.id === selectedNodeId);
    if (!carouselNode) return;

    const nextCardIndex = (carouselNodeData.cards?.length ?? 0) + 1;
    const cardId = `node_${nextIdRef.current++}`;
    const buttonId = `node_${nextIdRef.current++}`;
    const cardX = carouselNode.position.x + (nextCardIndex - 2) * 170;
    const cardY = carouselNode.position.y + 120;
    const buttonY = cardY + 100;

    setNodes((currentNodes) => [
      ...currentNodes,
      createFlowNode(cardId, cardX, cardY),
      createFlowNode(buttonId, cardX, buttonY),
    ]);
    setEdges((currentEdges) => [
      ...currentEdges,
      createEdge(selectedNodeId, cardId),
      createEdge(cardId, buttonId),
    ]);
    setNodeDataMap((prev) => ({
      ...prev,
      [selectedNodeId]: {
        ...prev[selectedNodeId],
        cards: [...(prev[selectedNodeId].cards ?? []), cardId],
      },
      [cardId]: {
        type: "carouselCard",
        title: `Card ${nextCardIndex}`,
        description: "",
      },
      [buttonId]: {
        type: "carouselButton",
        title: "Button 1",
        description: "",
      },
    }));
  }, [
    selectedNodeId,
    nodeDataMap,
    nodes,
    setNodeDataMap,
    setNodes,
    setEdges,
    createFlowNode,
    createEdge,
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
