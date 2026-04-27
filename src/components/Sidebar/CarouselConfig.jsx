import React, { useCallback } from "react";
import { addEdge } from "@xyflow/react";
import { buildAddCarouselCardPayload } from "../Canvas/utils";
import PropTypes from "prop-types";

export default function CarouselConfig({
  selectedNode,
  setNodes,
  setEdges,
  getNextNodeId,
  updateNode,
}) {
  const handleAddCarouselCard = useCallback(() => {
    const payload = buildAddCarouselCardPayload({
      selectedNodeId: selectedNode.id,
      carouselNode: selectedNode,
      getNextNodeId,
    });

    // Add nodes + edges in as few state updates as possible.
    setNodes((curr) => [...curr, ...payload.nodesToAdd]);
    setEdges((eds) => payload.edgesToAdd.reduce((acc, e) => addEdge(e, acc), eds));

    // Patch carousel node data (cards array).
    const patchForCarousel = payload.dataPatch?.[selectedNode.id];
    if (patchForCarousel) updateNode(patchForCarousel);
  }, [selectedNode, getNextNodeId, setEdges, setNodes, updateNode]);

  return (
    <button
      type="button"
      className="node-sidebar__add-card-button"
      onClick={handleAddCarouselCard}
    >
      + Add Card
    </button>
  );
}

CarouselConfig.propTypes = {
  selectedNode: PropTypes.object,
  setNodes: PropTypes.func.isRequired,
  setEdges: PropTypes.func.isRequired,
  getNextNodeId: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
};
