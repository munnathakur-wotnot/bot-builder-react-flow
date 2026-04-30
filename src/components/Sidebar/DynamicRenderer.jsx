import React, { useState } from "react";
import PropTypes from "prop-types";
import SidebarContent from "./SidebarContent";
import { getSidebarHandlers } from "./utils/sidebarHandlers";
import { CATEGORY_CONFIGS } from "./utils/categoryConfigs";

const LAYERMAPPING = {
  1: "firstLayer",
  2: "secondLayer",
};

export default function DynamicRenderer(props) {
  const { nodeType, nodeData } = props;
  const [layer, setlayer] = useState({ number: 1, data: null });

  const categoryConfigs = CATEGORY_CONFIGS[nodeData?.iCategory] ?? {};

  const configs = categoryConfigs?.getComponets
    ? categoryConfigs?.getComponets(nodeType)?.[LAYERMAPPING[layer.number]]
    : [];

  const handlers = getSidebarHandlers(props);

  if (configs?.length === 0) return null;

  return (
    <SidebarContent
      configs={configs}
      layer={layer}
      setlayer={setlayer}
      nodeData={nodeData}
      handlers={handlers}
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
};
