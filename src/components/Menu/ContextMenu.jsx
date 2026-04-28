import React, { useCallback } from "react";
import PropTypes from "prop-types";
import "./ContextMenu.css";
import { buildMenuActionMap } from "../Canvas/utils";
import { MENU_NODE_TEMPLATES } from "../Canvas/constants";
import { buildLaidOutGraph } from "../Canvas/layout";
import AppInput from "../Common/AppInput";

const MENU_OPTIONS = [
  { id: "collectInput", label: "Collect Input" },
  { id: "carousel", label: "Carousel" },
  { id: "form", label: "Form" },
];

export default function ContextMenu({
  menuState,
  setMenuState,
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedNodeId,
  getNextNodeId,
  nuberOfNodes,
}) {
  const handleSelect = useCallback(
    (optionId) => {
      if (!menuState?.nodeId) return;

      const sourceNode = nodes.find((n) => n.id === menuState.nodeId);
      if (!sourceNode) return;

      const actionByOption = buildMenuActionMap({
        context: {
          sourceNode,
          sourceNodeId: menuState.nodeId,
          allNodes: nodes,
        },
        templates: MENU_NODE_TEMPLATES,
        getNextNodeId,
      });

      const buildPayload = actionByOption[optionId];
      if (!buildPayload) {
        setMenuState(null);
        return;
      }

      const payload = buildPayload();
      const directTargets = payload.edgesToAdd
        .filter((edge) => edge.source === sourceNode.id)
        .map((edge) => edge.target);
      const nextNodes = nodes.map((node) => {
        if (node.id !== sourceNode.id) return node;

        return {
          ...node,
          data: {
            ...node.data,
            outPorts: [...(node.data.outPorts || []), ...directTargets],
            connected: directTargets.length > 0,
          },
        };
      });
      const mergedNodes = [...nextNodes, ...payload.nodesToAdd];
      const mergedEdges = [...edges, ...payload.edgesToAdd];
      const { nodes: laidOutNodes } = buildLaidOutGraph(
        mergedNodes,
        mergedEdges,
      );
      setNodes(laidOutNodes);
      setEdges(mergedEdges);
      setSelectedNodeId(payload.selectedNodeId);
      setMenuState(null);
    },
    [
      menuState,
      nodes,
      edges,
      setNodes,
      setEdges,
      setSelectedNodeId,
      getNextNodeId,
      setMenuState,
    ],
  );

  const bulkAddFromSource = useCallback(
    (optionId) => {
      const sourceNodeId = menuState?.nodeId;
      if (!sourceNodeId) return;

      const totalToAdd = Math.max(0, Number(nuberOfNodes || 0));
      if (totalToAdd <= 1) {
        handleSelect(optionId);
        return;
      }

      let workingNodes = nodes;
      let workingEdges = edges;
      let created = 0;
      let finalSelectedNodeId = null;
      const batchSize = 25;
      let aborted = false;

      const runBatch = () => {
        const batchLimit = Math.min(batchSize, totalToAdd - created);

        for (let i = 0; i < batchLimit; i++) {
          const sourceNode = workingNodes.find((n) => n.id === sourceNodeId);
          if (!sourceNode) {
            aborted = true;
            break;
          }

          const actionByOption = buildMenuActionMap({
            context: { sourceNode, sourceNodeId, allNodes: workingNodes },
            templates: MENU_NODE_TEMPLATES,
            getNextNodeId,
          });

          const buildPayload = actionByOption[optionId];
          if (!buildPayload) {
            aborted = true;
            break;
          }

          const payload = buildPayload();
          if (!payload) {
            aborted = true;
            break;
          }

          const directTargets = (payload.edgesToAdd || [])
            .filter((edge) => edge.source === sourceNodeId)
            .map((edge) => edge.target);

          const nextNodes = workingNodes.map((node) => {
            if (node.id !== sourceNodeId) return node;

            const existingOutPorts = node.data?.outPorts || [];
            const mergedOutPorts = Array.from(
              new Set([...existingOutPorts, ...directTargets]),
            );

            return {
              ...node,
              data: {
                ...node.data,
                outPorts: mergedOutPorts,
                connected: mergedOutPorts.length > 0,
              },
            };
          });

          workingNodes = [...nextNodes, ...(payload.nodesToAdd || [])];
          workingEdges = [...workingEdges, ...(payload.edgesToAdd || [])];
          finalSelectedNodeId = payload.selectedNodeId || finalSelectedNodeId;
          created++;
        }

        if (!aborted && created < totalToAdd) {
          requestAnimationFrame(runBatch);
          return;
        }

        const { nodes: laidOutNodes } = buildLaidOutGraph(
          workingNodes,
          workingEdges,
        );
        setNodes(laidOutNodes);
        setEdges(workingEdges);
        if (finalSelectedNodeId) setSelectedNodeId(finalSelectedNodeId);
        setMenuState(null);
      };

      runBatch();
    },
    [
      menuState,
      nuberOfNodes,
      nodes,
      edges,
      getNextNodeId,
      handleSelect,
      setNodes,
      setEdges,
      setSelectedNodeId,
      setMenuState,
    ],
  );

  if (!menuState) return null;

  return (
    <div
      className="context-menu"
      style={{ top: menuState.y, left: menuState.x }}
      role="menu"
    >
      <div className="context-menu__header">
        <AppInput className="context-menu__search" placeholder="Search..." />
      </div>

      <div className="context-menu__options">
        {MENU_OPTIONS.map((option) => (
          <button
            key={option.id}
            className="context-menu__option"
            type="button"
            onClick={() =>
              nuberOfNodes > 1
                ? bulkAddFromSource(option.id)
                : handleSelect(option.id)
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        className="context-menu__close"
        type="button"
        onClick={() => setMenuState(null)}
      >
        Close
      </button>
    </div>
  );
}

ContextMenu.propTypes = {
  menuState: PropTypes.shape({
    nodeId: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  setMenuState: PropTypes.func.isRequired,
  nodes: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
  setNodes: PropTypes.func.isRequired,
  setEdges: PropTypes.func.isRequired,
  setSelectedNodeId: PropTypes.func.isRequired,
  getNextNodeId: PropTypes.func.isRequired,
  nuberOfNodes: PropTypes.number,
};

ContextMenu.defaultProps = {
  menuState: null,
};
