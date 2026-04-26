import React from "react";
import PropTypes from "prop-types";
import "./NodeSidebar.css";
import useNodeUpdater from "../../hooks/useNodeUpdater";
import TitleDescriptionFields from "./TitleDescriptionFields";
import CarouselConfig from "./CarouselConfig";
import FormConfig from "./FormConfig";

// To add a new node type: create a new XxxConfig component and add it here.
const NODE_CONFIG_MAP = {
  carousel: CarouselConfig,
  form: FormConfig,
};

export default function NodeSidebar({
  selectedNode,
  setSelectedNode,
  setNodes,
  setEdges,
  getNextNodeId,
  onClose,
}) {
  const { updateNode } = useNodeUpdater({
    nodeId: selectedNode?.id,
    setNodes,
    setSelectedNode,
  });

  if (!selectedNode) return null;

  const nodeData = selectedNode.data;
  const ExtraConfig = NODE_CONFIG_MAP[nodeData.type] ?? null;

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

      {ExtraConfig && (
        <ExtraConfig
          nodeData={nodeData}
          updateNode={updateNode}
          selectedNode={selectedNode}
          setEdges={setEdges}
          getNextNodeId={getNextNodeId}
        />
      )}
    </aside>
  );
}

NodeSidebar.propTypes = {
  selectedNode: PropTypes.object,
  setSelectedNode: PropTypes.func.isRequired,
  setNodes: PropTypes.func.isRequired,
  setEdges: PropTypes.func.isRequired,
  getNextNodeId: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

NodeSidebar.defaultProps = {
  selectedNode: null,
};
