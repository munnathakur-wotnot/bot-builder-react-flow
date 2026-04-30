import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import "./NodeSidebar.css";
import useNodeUpdater from "../../hooks/useNodeUpdater";
import TitleDescriptionFields from "./TitleDescriptionFields";
import DynamicRenderer from "./DynamicRenderer";
import SidebarHeader from "./SidebarHeader";

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

  /**
   * layerStack is an array of { itemId } entries.
   *   length === 0  →  layer 0 (first layer, the list view)
   *   length === 1  →  layer 1 (e.g. card/field detail)
   *   length === 2  →  layer 2 (e.g. nested sub-detail)
   *   …and so on for any depth.
   *
   * "Back" pops the last entry.
   * "Navigate into item" pushes { itemId }.
   * No new state variable is needed when adding more layers.
   */
  const [layerStack, setLayerStack] = useState([]);

  // Reset to the root layer whenever the selected node changes
  useEffect(() => {
    setLayerStack([]);
  }, [selectedNodeId]);

  const handleNavigate = useCallback((item) => {
    setLayerStack((prev) => [...prev, { itemId: item.id }]);
  }, []);

  const nodeData = selectedNode?.data;
  const layerIndex = layerStack.length;
  const currentItemId = layerStack[layerStack.length - 1]?.itemId ?? null;

  // Derive the live item context for the current layer from nodes each render.
  // Carousel cards live as separate nodes; form fields live inside parent data.
  const layerContext = useMemo(() => {
    if (!currentItemId) return null;
    const itemNode = nodes.find((n) => n.id === currentItemId);
    if (itemNode) return { id: itemNode.id, ...itemNode.data };
    const fields = nodeData?.fields ?? [];
    return fields.find((f) => f.id === currentItemId) ?? null;
  }, [currentItemId, nodes, nodeData]);

  if (!selectedNode) return null;

  return (
    <aside className="node-sidebar">
      <SidebarHeader
        onClose={onClose}
        layerIndex={layerIndex}
        setLayerStack={setLayerStack}
      />

      {/* Title/description only visible on the root layer */}
      {layerIndex === 0 && (
        <TitleDescriptionFields nodeData={nodeData} updateNode={updateNode} />
      )}

      {/* Single DynamicRenderer — adapts to any layer depth via layerIndex */}
      <DynamicRenderer
        nodeType={nodeData.type}
        nodeData={nodeData}
        updateNode={updateNode}
        selectedNode={selectedNode}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        getNextNodeId={getNextNodeId}
        layerIndex={layerIndex}
        layerContext={layerContext}
        onNavigate={handleNavigate}
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
