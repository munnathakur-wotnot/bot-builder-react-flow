import {
  handleAddCarousel,
  handleAddForm,
  handleRemoveCarouselCard,
} from "../helper";

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
  const updateter = (updatedData, type) => {
    updateNode({ [type]: updatedData });
  };

  const removeItem = (Id, type) => {
    console.log("Remove Card", "Remove Card");

    const items = nodeData?.[type] ?? [];
    console.log(items, "Remove Card");

    updateter(
      items.filter((field) => {
        if (typeof field === "string") return field !== Id;
        return field.id !== Id;
      }),
      type,
    );
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
      reorderCards: (cards) => updateter(cards, "cards"),
      removeCard: (id) =>
        handleRemoveCarouselCard({
          selectedNode,
          nodes,
          edges,
          cardId: id,
          setNodes,
          setEdges,
          updateNode,
        }),
    },
    form: {
      reorderFields: (fields) => updateter(fields, "fields"),
      updateFieldLabel: (fieldId, label) => {
        const fields = nodeData?.fields ?? [];

        updateter(
          fields.map((field) =>
            field.id === fieldId ? { ...field, label } : field,
          ),
          "fields",
        );
      },
      updateFieldType: (fieldId, type) => {
        const fields = nodeData?.fields ?? [];
        updateter(
          fields.map((field) =>
            field.id === fieldId ? { ...field, type } : field,
          ),
          "fields",
        );
      },
      removeField: (id) => removeItem(id, "fields"),
      addFormField: () =>
        handleAddForm({
          nodeData,
          updateNode,
        }),
    },
  };
}
