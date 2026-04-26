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
import { INITIAL_EDGES, INITIAL_NODES, MENU_NODE_TEMPLATES } from "./constants";
import { buildAddCarouselCardPayload, buildMenuActionMap } from "./utils";
import useUpdateNode from "../../hooks/useUpdateNode";
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
  const { updateSingleNode } = useUpdateNode(setNodes);
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

  const handleMenuSelect = useCallback(
    (optionId) => {
      if (!menuState?.nodeId) return;
      console.log("HandleManusElected", menuState);

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
      console.log(payload, "Payload", sourceNode);

      updateSingleNode(sourceNode.id, (node) => ({
        ...node,
        data: {
          ...node.data,
          outPorts: [
            ...(node.data.outPorts || []),
            ...payload.nodesToAdd.map((item) => item.id),
          ],
          connected: payload.nodesToAdd.length > 0,
        },
      }));

      setNodes((currentNodes) => [...currentNodes, ...payload.nodesToAdd]);
      setEdges((currentEdges) => [...currentEdges, ...payload.edgesToAdd]);
      setSelectedNode(
        payload.nodesToAdd.find((item) => item.id === payload.selectedNodeId),
      );
      setMenuState(null);
    },
    [menuState, nodes, setNodes, setEdges, getNextNodeId],
  );

  const handleAddCarouselCard = useCallback(() => {
    if (!selectedNode) return;
    const carouselNodeData = selectedNode;
    console.log(carouselNodeData, "CarouselNodeData");

    if (!carouselNodeData || carouselNodeData.data.type !== "carousel") return;
    console.log(selectedNode, "Selected Node2111");

    const carouselNode = selectedNode;
    if (!carouselNode) return;

    const payload = buildAddCarouselCardPayload({
      selectedNodeId: selectedNode.id,
      carouselNodeData,
      carouselNode,
      getNextNodeId,
    });

    function handleEdgeCreate(params) {
      // 1. edge add
      setEdges((eds) => addEdge(params, eds));

      console.log(params, "params");
    }
    payload.edgesToAdd.forEach((edge) => {
      handleEdgeCreate(edge);
    });

    //setNodes((currentNodes) => [...currentNodes, ...payload.nodesToAdd]);
    setEdges((currentEdges) => [...currentEdges, ...payload.edgesToAdd]);
  }, [nodes, setNodes, setEdges, getNextNodeId]);

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
          position={menuState ? { x: menuState.x, y: menuState.y } : null}
          onSelect={handleMenuSelect}
          onClose={() => setMenuState(null)}
        />

        <NodeSidebar
          selectedNodeData={selectedNodeData}
          onChangeTitle={(title) => {
            const updater = (node) => {
              return {
                ...node,
                data: {
                  ...node.data,
                  title: title,
                },
              };
            };
            updateSingleNode(selectedNode.id, updater);
            setSelectedNode((prev) => ({
              ...prev,
              data: {
                ...prev.data,
                title: title,
              },
            }));
          }}
          onChangeDescription={(description) => {
            const updater = (node) => {
              return {
                ...node,
                data: {
                  ...node.data,
                  description: description,
                },
              };
            };
            updateSingleNode(selectedNode.id, updater);
            setSelectedNode((prev) => ({
              ...prev,
              data: {
                ...prev.data,
                description: description,
              },
            }));
          }}
          onAddCarouselCard={handleAddCarouselCard}
          onUpdateFormFields={(fields) => {
            updateSingleNode(selectedNode.id, (node) => ({
              ...node,
              data: { ...node.data, fields },
            }));
            setSelectedNode((prev) => ({
              ...prev,
              data: { ...prev.data, fields },
            }));
          }}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
