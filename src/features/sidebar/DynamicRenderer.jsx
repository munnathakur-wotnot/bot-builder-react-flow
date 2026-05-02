import React from "react";
import PropTypes from "prop-types";
import SidebarContent from "./SidebarContent";
import { CATEGORY_CONFIGS } from "./utils/categoryConfigs";

export default function DynamicRenderer(props) {
  const { nodeType, nodeData, layerIndex = 0, layerContext, onNavigate } = props;

  const categoryConfig = CATEGORY_CONFIGS[nodeData?.iCategory] ?? {};
  const rawConfig = categoryConfig?.getComponents
    ? categoryConfig.getComponents(nodeType)
    : null;

  if (!rawConfig) return null;

  // Support both legacy flat array and new { layers: [[],[],…] } shape.
  // layerIndex 0 = root list, 1 = item detail, 2 = nested detail, etc.
  const allConfigs = Array.isArray(rawConfig)
    ? rawConfig
    : (rawConfig?.layers?.[layerIndex] ?? []);

  // Filter out entries that declare shouldRender and evaluate to false.
  const renderContext = { nodeData, layerContext: props.layerContext };
  const configs = allConfigs.filter((c) =>
    typeof c.shouldRender === "function" ? c.shouldRender(renderContext) : true
  );

  if (configs.length === 0) return null;

  const handlers = categoryConfig?.getHandlers ? categoryConfig.getHandlers(props) : {};

  return (
    <SidebarContent
      configs={configs}
      nodeData={nodeData}
      handlers={handlers}
      onNavigate={onNavigate}
      layerContext={layerContext}
    />
  );
}

DynamicRenderer.propTypes = {
  nodeType: PropTypes.string,
  selectedNode: PropTypes.object,
  nodes: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
  setNodes: PropTypes.func.isRequired,
  setEdges: PropTypes.func.isRequired,
  getNextNodeId: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
  nodeData: PropTypes.object,
  layerIndex: PropTypes.number,
  layerContext: PropTypes.object,
  onNavigate: PropTypes.func,
};
