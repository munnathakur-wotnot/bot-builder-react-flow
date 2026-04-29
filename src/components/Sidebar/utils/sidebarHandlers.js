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
    carousel: {
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
    },
    form: {
      reorderFields: (fields) => {
        updateFields(fields);
      },
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
      addFormField: () =>
        handleAddForm({
          nodeData,
          updateNode,
        }),
    },
  };
}
