import React, { useCallback } from "react";
import PropTypes from "prop-types";
import "./ContextMenu.css";
import useUpdateNode from "../../hooks/useUpdateNode";
import { buildMenuActionMap } from "../Canvas/utils";
import { MENU_NODE_TEMPLATES } from "../Canvas/constants";

const MENU_OPTIONS = [
  { id: "collectInput", label: "Collect Input" },
  { id: "carousel", label: "Carousel" },
  { id: "form", label: "Form" },
];

export default function ContextMenu({
  menuState,
  setMenuState,
  nodes,
  setNodes,
  setEdges,
  setSelectedNodeId,
  getNextNodeId,
  nuberOfNodes,
}) {
  const { updateSingleNode } = useUpdateNode(setNodes);

  const handleSelect = useCallback(
    (optionId) => {
      if (!menuState?.nodeId) return;

      const sourceNode = nodes.find((n) => n.id === menuState.nodeId);
      if (!sourceNode) return;

      const actionByOption = buildMenuActionMap({
        context: { sourceNode, sourceNodeId: menuState.nodeId },
        templates: MENU_NODE_TEMPLATES,
        getNextNodeId,
      });

      const buildPayload = actionByOption[optionId];
      if (!buildPayload) {
        setMenuState(null);
        return;
      }

      const payload = buildPayload();

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

      setNodes((curr) => [...curr, ...payload.nodesToAdd]);
      setEdges((curr) => [...curr, ...payload.edgesToAdd]);
      setSelectedNodeId(payload.selectedNodeId);
      setMenuState(null);
    },
    [
      menuState,
      nodes,
      setNodes,
      setEdges,
      setSelectedNodeId,
      getNextNodeId,
      updateSingleNode,
      setMenuState,
    ],
  );
  const performanceChecker = (id) => {
    const batchSize = 100;
    let count = 0;

    const runBatch = () => {
      for (let i = 0; i < batchSize && count < nuberOfNodes; i++) {
        handleSelect(id);
        count++;
      }

      if (count < nuberOfNodes) {
        requestAnimationFrame(runBatch);
      }
    };

    runBatch();
  };
  if (!menuState) return null;

  return (
    <div
      className="context-menu"
      style={{ top: menuState.y, left: menuState.x }}
      role="menu"
    >
      <div className="context-menu__header">
        <input className="context-menu__search" placeholder="Search..." />
      </div>

      <div className="context-menu__options">
        {MENU_OPTIONS.map((option) => (
          <button
            key={option.id}
            className="context-menu__option"
            type="button"
            onClick={() =>
              nuberOfNodes > 1
                ? performanceChecker(option.id)
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
  setNodes: PropTypes.func.isRequired,
  setEdges: PropTypes.func.isRequired,
  setSelectedNodeId: PropTypes.func.isRequired,
  getNextNodeId: PropTypes.func.isRequired,
  nuberOfNodes: PropTypes.number,
  setIsProcessing: PropTypes.func,
};

ContextMenu.defaultProps = {
  menuState: null,
};
