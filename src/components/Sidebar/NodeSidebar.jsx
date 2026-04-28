import React from "react";
import PropTypes from "prop-types";
import "./NodeSidebar.css";
import useNodeUpdater from "../../hooks/useNodeUpdater";
import TitleDescriptionFields from "./TitleDescriptionFields";
import SidebarChecker from "./SidebarChecker";

export default function NodeSidebar({
  selectedNodeId,
  nodes,
  edges,
  setNodes,
  setEdges,
  getNextNodeId,
  onClose,
}) {
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const { updateNode } = useNodeUpdater({
    nodeId: selectedNode?.id,
    setNodes,
  });

  if (!selectedNode) return null;

  const nodeData = selectedNode.data;
  console.log(selectedNode, "Selected Node");

  return (
    <aside className="node-sidebar">
      <div className="node-sidebar__header">
        <h3 className="node-sidebar__title">Node Config</h3>
        <button
          type="button"
          className="node-sidebar__close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <TitleDescriptionFields nodeData={nodeData} updateNode={updateNode} />
      <SidebarChecker
        nodeType={nodeData.type}
        nodeData={nodeData}
        updateNode={updateNode}
        selectedNode={selectedNode}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        getNextNodeId={getNextNodeId}
      />
    </aside>
  );
}

NodeSidebar.propTypes = {
  selectedNodeId: PropTypes.string,
  nodes: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
  setNodes: PropTypes.func.isRequired,
  setEdges: PropTypes.func.isRequired,
  getNextNodeId: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

NodeSidebar.defaultProps = {
  selectedNodeId: null,
};
