import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./NodeSidebar.css";
import TitleDescriptionFields from "./TitleDescriptionFields";
import DynamicRenderer from "./DynamicRenderer";
import SidebarHeader from "./SidebarHeader";
import { useResizable } from "../../shared/hooks/useResizable";

export default function NodeSidebar({
  selectedNodeId,
  nodes,
  edges,
  setNodes,
  setEdges,
  getNextNodeId,
  selectedNode,
  updateNode,
  onClose,
}) {
  const { width, isResizing, startResizing } = useResizable({
    initialWidth: 360,
    minWidth: 280,
    maxWidth: 600,
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
    setLayerStack((prev) => [
      ...prev,
      { itemId: item.id, itemType: item._type ?? null },
    ]);
  }, []);

  const nodeData = selectedNode?.data;
  const layerIndex = layerStack.length;
  const currentItemId = layerStack[layerStack.length - 1]?.itemId ?? null;
  const currentItemType = layerStack[layerStack.length - 1]?.itemType ?? null;

  if (!selectedNode) return null;

  return (
    <aside
      className={`node-sidebar ${isResizing ? "resizing" : ""}`}
      style={{ width }}
    >
      <div
        className="node-sidebar__resizer"
        onMouseDown={() => startResizing(true)}
      />
      <SidebarHeader
        onClose={onClose}
        layerIndex={layerIndex}
        setLayerStack={setLayerStack}
      />

      <div className="node-sidebar__body">
        {/* Title/description only on root layer  */}
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
          currentItemId={currentItemId}
          currentItemType={currentItemType}
          onNavigate={handleNavigate}
        />
      </div>
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
  selectedNode: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
};

NodeSidebar.defaultProps = {
  selectedNodeId: null,
};
