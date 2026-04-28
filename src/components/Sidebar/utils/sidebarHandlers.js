import { handleAddCarousel, handleAddForm } from "../helper";

export function getSidebarHandlers({
  selectedNode,
  nodes,
  edges,
  getNextNodeId,
  setNodes,
  setEdges,
  updateNode,
  nodeData,
}) {
  const updateFields = (updatedFields) => {
    updateNode({ fields: updatedFields });
  };

  return {
    addCarouselCard: () =>
      handleAddCarousel({
        selectedNode,
        nodes,
        edges,
        getNextNodeId,
        setNodes,
        setEdges,
        updateNode,
      }),
    addFormField: () =>
      handleAddForm({
        nodeData,
        updateNode,
      }),
    form: {
      updateFieldLabel: (fieldId, label) => {
        const fields = nodeData?.fields ?? [];
        updateFields(
          fields.map((field) =>
            field.id === fieldId ? { ...field, label } : field,
          ),
        );
      },
      updateFieldType: (fieldId, type) => {
        const fields = nodeData?.fields ?? [];
        updateFields(
          fields.map((field) =>
            field.id === fieldId ? { ...field, type } : field,
          ),
        );
      },
      removeField: (fieldId) => {
        const fields = nodeData?.fields ?? [];
        updateFields(fields.filter((field) => field.id !== fieldId));
      },
    },
  };
}
