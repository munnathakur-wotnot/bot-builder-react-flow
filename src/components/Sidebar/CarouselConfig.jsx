import { useCallback } from "react";
import { addEdge } from "@xyflow/react";
import { buildAddCarouselCardPayload } from "../Canvas/utils";

export default function CarouselConfig({ selectedNode, setEdges, getNextNodeId }) {
  const handleAddCarouselCard = useCallback(() => {
    const payload = buildAddCarouselCardPayload({
      selectedNodeId: selectedNode.id,
      carouselNodeData: selectedNode,
      carouselNode: selectedNode,
      getNextNodeId,
    });
    payload.edgesToAdd.forEach((edge) => {
      setEdges((eds) => addEdge(edge, eds));
    });
  }, [selectedNode, getNextNodeId, setEdges]);

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
