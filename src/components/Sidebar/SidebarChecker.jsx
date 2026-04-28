import React from "react";
import PropTypes from "prop-types";
import SidebarContent from "./SidebarContent";
import { SIDEBAR_CONFIGS } from "./utils/sidebarConfigs";
import { getSidebarHandlers } from "./utils/sidebarHandlers";

export default function SidebarChecker(props) {
  const { nodeType, nodeData } = props;

  const configs = SIDEBAR_CONFIGS[nodeType] ?? [];
  if (configs.length === 0) return null;
  const handlers = getSidebarHandlers(props);

  return (
    <SidebarContent configs={configs} nodeData={nodeData} handlers={handlers} />
  );
}

SidebarChecker.propTypes = {
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
