import React from "react";
import PropTypes from "prop-types";
import SidebarContent from "./SidebarContent";
import { getSidebarHandlers } from "./utils/sidebarHandlers";
import { CATEGORY_CONFIGS } from "./utils/categoryConfigs";

export default function DynamicRenderer(props) {
  const { nodeType, nodeData } = props;

  const categoryConfigs = CATEGORY_CONFIGS[nodeData?.iCategory] ?? {};
  const configs = categoryConfigs?.getComponets
    ? categoryConfigs?.getComponets(nodeType)
    : [];

  if (configs?.length === 0) return null;
  const handlers = getSidebarHandlers(props);

  return (
    <SidebarContent configs={configs} nodeData={nodeData} handlers={handlers} />
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
};
